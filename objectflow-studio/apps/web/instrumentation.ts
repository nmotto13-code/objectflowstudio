// Next.js calls register() once per runtime (nodejs, edge) at startup.
// We delegate to runtime-specific Sentry configs.

import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Captures errors that bubble up from React Server Components, server actions,
// and route handlers. Without this, server-side errors don't reach Sentry.
export const onRequestError = Sentry.captureRequestError;
