// Edge-runtime Sentry init (middleware.ts and any `runtime = 'edge'` routes).

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN_WEB ?? process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    release: process.env.SENTRY_RELEASE,

    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '1.0'),

    initialScope: {
      tags: { service: 'web', runtime: 'edge' },
    },
  });
}
