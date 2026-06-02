import { config } from 'dotenv';
import { resolve } from 'node:path';
import { defineConfig } from 'drizzle-kit';

// Load from monorepo root .env.local (drizzle-kit runs cwd = packages/db)
config({ path: resolve(process.cwd(), '../../.env.local'), override: true });

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
