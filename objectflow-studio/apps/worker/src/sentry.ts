// MUST be imported AFTER load-env.ts and BEFORE Fastify/handler imports so
// Sentry can patch http/fetch/etc. for full auto-instrumentation. We also call
// it BEFORE telemetry.ts so Sentry's own OTel hooks don't conflict with the
// Langfuse OTel pipeline (Sentry v8 uses OTel internally — order matters).

import * as Sentry from '@sentry/node';
// Note: @sentry/profiling-node has no prebuilt binary for Node 24 on Windows
// as of v8.55.2. Skip CPU profiling until we either upgrade Sentry SDK or
// pin Node to a version with binary support. Tracing/error capture works fine
// without it.

const dsn = process.env.SENTRY_DSN_WORKER ?? process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    release: process.env.SENTRY_RELEASE,

    // Performance: 100% sampling in dev, drop to ~0.1 in prod via env override.
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '1.0'),
    integrations: [],

    // Don't capture noisy non-error logs.
    beforeSend(event) {
      if (event.level === 'log' || event.level === 'info') return null;
      return event;
    },

    // Tag every event with our service name so the Sentry dashboard can
    // filter `worker` vs `web` vs future services.
    initialScope: {
      tags: { service: 'worker' },
    },
  });

  console.log('[sentry] worker initialized');
} else {
  console.log('[sentry] no DSN — skipping worker init');
}

export { Sentry };
