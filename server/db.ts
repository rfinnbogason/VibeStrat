import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "../shared/schema";

// Use ws polyfill for local dev; Vercel serverless has native WebSocket support
try {
  const ws = await import("ws");
  neonConfig.webSocketConstructor = ws.default;
} catch {
  // Running in environment with native WebSocket (e.g., Vercel)
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required. Set it in your .env file.');
}

console.log('📊 Connecting to PostgreSQL database...');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });
console.log('✅ PostgreSQL database connected');

export { pool, db };
