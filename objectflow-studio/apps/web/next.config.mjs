import { existsSync } from 'node:fs';
import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withSentryConfig } from '@sentry/nextjs';

// Preferred workflow: secrets injected by `doppler run -- pnpm dev`. Fallback:
// root .env.local if it exists (legacy, for collaborators without Doppler).
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../../.env.local');
if (existsSync(envPath)) {
  config({ path: envPath, override: true });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@objectflow/auth',
    '@objectflow/config',
    '@objectflow/db',
    '@objectflow/events',
    '@objectflow/trpc',
    '@objectflow/ui',
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

// withSentryConfig handles source-map uploads, route auto-instrumentation,
// and tunnel routing so ad-blockers don't drop error reports. Build-time
// upload requires a SENTRY_AUTH_TOKEN — without it source maps simply aren't
// uploaded but errors still report.
export default withSentryConfig(nextConfig, {
  org: 'nathan-motto',
  project: 'objectflow-web',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Routes Sentry events through /monitoring to bypass ad-blockers.
  tunnelRoute: '/monitoring',
  disableLogger: true,
  automaticVercelMonitors: true,
});
