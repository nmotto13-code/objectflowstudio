// Loads .env.local from the monorepo root as a fallback for the non-Doppler
// dev workflow. Must be the first import in every entry point.
//
// Workflow precedence:
//   1. Vars injected by `doppler run` (preferred) — already in process.env
//   2. Vars in .env.local at the monorepo root (legacy fallback if file exists)
//   3. Nothing — Zod env validation will fail loudly
//
// If both #1 and #2 are present, #2 overrides — but the preferred workflow is
// to delete .env.local once Doppler is set up.

import { existsSync } from 'node:fs';
import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../../../.env.local');

if (existsSync(envPath)) {
  // override:true keeps the override-empty-shell-vars behavior we used
  // pre-Doppler. With Doppler, this file usually doesn't exist.
  config({ path: envPath, override: true });
}
