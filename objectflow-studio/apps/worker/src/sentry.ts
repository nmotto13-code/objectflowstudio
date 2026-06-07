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

    // Disable Sentry's auto OTel setup. Without this flag, @sentry/node v8
    // registers its OWN global TracerProvider during init() — which happens
    // before telemetry.ts runs — and then our NodeTracerProvider.register()
    // call no-ops because OTel's API only accepts one global provider per
    // process. Result: spans get routed to Sentry's processor and never
    // reach Langfuse. Langfuse is our system of record for agent traces
    // (model/tokens/cost), so it owns the OTel provider; Sentry stays in
    // its lane (error capture via beforeSend + the Fastify setErrorHandler).
    // We give up Sentry's performance tracing here, which we don't use.
    skipOpenTelemetrySetup: true,

    // tracesSampleRate becomes a no-op once skipOpenTelemetrySetup is true,
    // but kept in env for the day we re-enable a unified OTel setup.
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

  console.log('[sentry] worker initialized (OTel setup skipped — owned by telemetry.ts)');
} else {
  console.log('[sentry] no DSN — skipping worker init');
}

export { Sentry };
