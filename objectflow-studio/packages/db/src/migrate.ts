import { existsSync } from 'node:fs';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// Preferred: `doppler run -- pnpm db:migrate`. Fallback: root .env.local.
const envPath = resolve(process.cwd(), '../../.env.local');
if (existsSync(envPath)) {
  config({ path: envPath, override: true });
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required to run migrations');

  const client = postgres(url, { max: 1, prepare: false });
  const db = drizzle(client);

  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations complete.');

  await client.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
