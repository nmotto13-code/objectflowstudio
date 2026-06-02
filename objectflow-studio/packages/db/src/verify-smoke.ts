// Must load .env.local before any imports that trigger env validation.
import { config } from 'dotenv';
import { resolve } from 'node:path';
config({ path: resolve(process.cwd(), '../../.env.local') });

// Dynamic imports so the env loads first.
const { getDb, sql, closeDb } = await import('./index.js');
const { _health } = await import('./schema/health.js');

const db = getDb();

// Confirm pgvector is enabled.
const ext = await db.execute(
  sql`SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'`,
);
console.log('pgvector extension:', ext[0] ?? 'NOT INSTALLED');

// Round-trip: insert + select.
const inserted = await db
  .insert(_health)
  .values({ note: 'L0 smoke ' + new Date().toISOString() })
  .returning();
console.log('Inserted:', inserted[0]);

const rows = await db.select().from(_health).limit(5);
console.log('Recent rows:', rows.length, '— last:', rows[rows.length - 1]);

await closeDb();
console.log('OK');
