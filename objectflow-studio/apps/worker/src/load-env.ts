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

// L0 bridge: until we split dev vs prd Doppler configs (L1 work), the
// Railway production deploy reads the same dev Doppler config the local
// devs use — which sets INNGEST_DEV=1 so devs can point at the local
// Inngest dev server. That's wrong for the deployed worker: with
// INNGEST_DEV=1 the SDK runs unsigned dev mode, and Inngest Cloud
// rightly refuses to sync the app ("SDK response was not signed").
// Detect we're running on Railway via the platform-set
// RAILWAY_ENVIRONMENT var (which Doppler can't override — it's injected
// by Railway itself, not by integrations) and unset INNGEST_DEV before
// any module reads it.
if (process.env.RAILWAY_ENVIRONMENT && process.env.INNGEST_DEV) {
  delete process.env.INNGEST_DEV;
}
