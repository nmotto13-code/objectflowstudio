// Browser-side Sentry init. Next.js auto-loads this file when present.

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN_WEB;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',

    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '1.0'),

    // Capture user interactions for session replay context (no recording yet —
    // replay sampling is opt-in once we have a privacy policy).
    integrations: [],

    initialScope: {
      tags: { service: 'web', runtime: 'browser' },
    },
  });
}

// Note: Sentry's `captureRouterTransitionStart` lands in v9. We're on v8 —
// browser performance tracing still works via NodeSDK auto-instrumentation;
// router-transition spans are nice-to-have, not required.
