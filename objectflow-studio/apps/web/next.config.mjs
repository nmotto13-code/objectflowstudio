import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Load root .env.local so monorepo-wide secrets work without duplication.
// Next.js only reads .env.local inside the app directory by default.
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env.local') });

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

export default nextConfig;
