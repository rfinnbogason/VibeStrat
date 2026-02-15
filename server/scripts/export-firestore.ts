/**
 * Export all Firestore collections to JSON files for migration to PostgreSQL.
 *
 * Usage: npx tsx server/scripts/export-firestore.ts
 *
 * This will create a migration-data/ directory with one JSON file per collection.
 */

import { db, collections } from '../firebase-db';
import fs from 'fs/promises';
import path from 'path';

const OUTPUT_DIR = path.resolve(process.cwd(), 'migration-data');

// All collections to export (includes subcollections used in the app)
const COLLECTIONS_TO_EXPORT = [
  'users',
  'strata',
  'userStrataAccess',
  'units',
  'expenses',
  'vendors',
  'vendorContracts',
  'vendorHistory',
  'quotes',
  'meetings',
  'documents',
  'documentFolders',
  'maintenanceRequests',
  'maintenanceProjects',
  'announcements',
  'messages',
  'notifications',
  'dismissedNotifications',
  'funds',
  'fundTransactions', // May be subcollection under funds
  'paymentReminders',
  'pendingRegistrations',
  'residentDirectory',
  'reports',
  'feeTiers',
  'repairRequests',
];

function convertFirestoreTimestamp(value: any): any {
  if (value === null || value === undefined) return value;

  // Firestore Timestamp object
  if (value && typeof value === 'object' && value._seconds !== undefined) {
    return new Date(value._seconds * 1000 + (value._nanoseconds || 0) / 1000000).toISOString();
  }
  if (value && typeof value === 'object' && value.seconds !== undefined) {
    return new Date(value.seconds * 1000 + (value.nanoseconds || 0) / 1000000).toISOString();
  }
  // Firestore Timestamp with toDate
  if (value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }

  // Recurse into arrays
  if (Array.isArray(value)) {
    return value.map(convertFirestoreTimestamp);
  }

  // Recurse into objects
  if (typeof value === 'object' && value !== null) {
    const result: any = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = convertFirestoreTimestamp(val);
    }
    return result;
  }

  return value;
}

async function exportCollection(collectionName: string): Promise<number> {
  try {
    const snapshot = await db.collection(collectionName).get();

    if (snapshot.empty) {
      console.log(`  [skip] ${collectionName}: 0 documents`);
      return 0;
    }

    const data = snapshot.docs.map(doc => {
      const rawData = doc.data();
      const converted = convertFirestoreTimestamp(rawData);
      return {
        id: doc.id,
        ...converted,
      };
    });

    const filePath = path.join(OUTPUT_DIR, `${collectionName}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    console.log(`  [done] ${collectionName}: ${data.length} documents`);
    return data.length;
  } catch (error: any) {
    console.error(`  [error] ${collectionName}: ${error.message}`);
    return 0;
  }
}

async function exportFundTransactions(): Promise<number> {
  // Fund transactions are stored as subcollections under each fund
  try {
    const fundsSnapshot = await db.collection('funds').get();
    const allTransactions: any[] = [];

    for (const fundDoc of fundsSnapshot.docs) {
      const txSnapshot = await fundDoc.ref.collection('transactions').get();
      for (const txDoc of txSnapshot.docs) {
        const data = convertFirestoreTimestamp(txDoc.data());
        allTransactions.push({
          id: txDoc.id,
          fundId: fundDoc.id,
          ...data,
        });
      }
    }

    if (allTransactions.length > 0) {
      const filePath = path.join(OUTPUT_DIR, 'fundTransactions.json');
      await fs.writeFile(filePath, JSON.stringify(allTransactions, null, 2));
      console.log(`  [done] fundTransactions (subcollection): ${allTransactions.length} documents`);
    } else {
      console.log(`  [skip] fundTransactions: 0 documents`);
    }

    return allTransactions.length;
  } catch (error: any) {
    console.error(`  [error] fundTransactions: ${error.message}`);
    return 0;
  }
}

async function main() {
  console.log('Exporting Firestore data...');
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  // Create output directory
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  let totalDocuments = 0;

  for (const collection of COLLECTIONS_TO_EXPORT) {
    if (collection === 'fundTransactions') {
      totalDocuments += await exportFundTransactions();
    } else {
      totalDocuments += await exportCollection(collection);
    }
  }

  console.log(`\nExport complete: ${totalDocuments} total documents`);
  console.log(`Files saved to: ${OUTPUT_DIR}/`);
}

main().catch(console.error);
