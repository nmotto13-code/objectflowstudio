import { existsSync } from 'node:fs';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { defineConfig } from 'drizzle-kit';

// Preferred: `doppler run -- pnpm db:generate`. Fallback: root .env.local.
const envPath = resolve(process.cwd(), '../../.env.local');
if (existsSync(envPath)) {
  config({ path: envPath, override: true });
}

export default defineConfig({
  // Explicit list — drizzle-kit's CJS loader doesn't grok `.js` suffix in re-exports,
  // so we bypass src/schema/index.ts and list table files directly. Add new tables here.
  schema: ['./src/schema/health.ts'],
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});
