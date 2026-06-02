// Loads .env.local from the monorepo root BEFORE any module that reads env vars.
// Must be the first import in every entry point (server.ts, verify-smoke scripts).
import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// From apps/worker/src or apps/worker/dist back up to monorepo root.
// `override: true` is critical — Claude Code / harness shells sometimes
// pre-set env vars (e.g. ANTHROPIC_API_KEY="") that would otherwise win over
// .env.local. For local dev the file should always be the source of truth.
config({ path: resolve(__dirname, '../../../.env.local'), override: true });
