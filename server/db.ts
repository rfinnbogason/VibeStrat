import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// PostgreSQL database is optional - we're using Firestore as primary database
let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  console.log('📊 Connecting to PostgreSQL database...');
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
  console.log('✅ PostgreSQL database connected');
} else {
  console.log('ℹ️  PostgreSQL not configured - using Firestore only');
}

export { pool, db };