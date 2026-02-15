/**
 * Validate that Firestore data was correctly migrated to PostgreSQL.
 *
 * Usage: DATABASE_URL=your_neon_url npx tsx server/scripts/validate-migration.ts
 *
 * Compares record counts between exported JSON files and PostgreSQL tables.
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from 'ws';
import * as schema from '@shared/schema';
import fs from 'fs/promises';
import path from 'path';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

const DATA_DIR = path.resolve(process.cwd(), 'migration-data');

const TABLE_MAP: Record<string, any> = {
  users: schema.users,
  strata: schema.strata,
  userStrataAccess: schema.userStrataAccess,
  units: schema.units,
  expenses: schema.expenses,
  vendors: schema.vendors,
  vendorContracts: schema.vendorContracts,
  vendorHistory: schema.vendorHistory,
  quotes: schema.quotes,
  meetings: schema.meetings,
  documents: schema.documents,
  documentFolders: schema.documentFolders,
  maintenanceRequests: schema.maintenanceRequests,
  maintenanceProjects: schema.maintenanceProjects,
  announcements: schema.announcements,
  messages: schema.messages,
  notifications: schema.notifications,
  dismissedNotifications: schema.dismissedNotifications,
  funds: schema.funds,
  fundTransactions: schema.fundTransactions,
  paymentReminders: schema.paymentReminders,
  pendingRegistrations: schema.pendingStrataRegistrations,
  residentDirectory: schema.residentDirectory,
  reports: schema.reports,
  feeTiers: schema.feeTiers,
  repairRequests: schema.repairRequests,
};

async function getJsonCount(collection: string): Promise<number> {
  try {
    const filePath = path.join(DATA_DIR, `${collection}.json`);
    const raw = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(raw);
    return data.length;
  } catch {
    return 0;
  }
}

async function getPostgresCount(table: any): Promise<number> {
  try {
    const result = await db.select({ count: sql<number>`count(*)` }).from(table);
    return Number(result[0]?.count || 0);
  } catch {
    return 0;
  }
}

async function main() {
  console.log('Validating migration...\n');
  console.log('Collection'.padEnd(30) + 'Firestore'.padEnd(12) + 'Postgres'.padEnd(12) + 'Status');
  console.log('-'.repeat(66));

  let totalFirestore = 0;
  let totalPostgres = 0;
  let mismatches = 0;

  for (const [collection, table] of Object.entries(TABLE_MAP)) {
    const jsonCount = await getJsonCount(collection);
    const pgCount = await getPostgresCount(table);
    totalFirestore += jsonCount;
    totalPostgres += pgCount;

    let status = '';
    if (jsonCount === 0 && pgCount === 0) {
      status = 'EMPTY';
    } else if (jsonCount === pgCount) {
      status = 'OK';
    } else {
      status = `MISMATCH (diff: ${pgCount - jsonCount})`;
      mismatches++;
    }

    console.log(
      collection.padEnd(30) +
      String(jsonCount).padEnd(12) +
      String(pgCount).padEnd(12) +
      status
    );
  }

  console.log('-'.repeat(66));
  console.log(
    'TOTAL'.padEnd(30) +
    String(totalFirestore).padEnd(12) +
    String(totalPostgres).padEnd(12) +
    (mismatches === 0 ? 'ALL OK' : `${mismatches} MISMATCHES`)
  );

  console.log(`\nValidation ${mismatches === 0 ? 'PASSED' : 'FAILED'}`);

  await pool.end();
  process.exit(mismatches === 0 ? 0 : 1);
}

main().catch(err => {
  console.error('Validation failed:', err);
  process.exit(1);
});
