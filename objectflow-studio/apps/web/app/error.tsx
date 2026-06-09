'use client';

// Route-level error boundary for App Router. Required by Next 15 — without
// this file Next falls back to a Pages-Router-style internal error page,
// which combined with @sentry/nextjs v8's webpack instrumentation causes a
// `<Html> should not be imported outside of pages/_document` build error
// when prerendering /404 and /500.
//
// Sentry guidance for App Router projects: have both `error.tsx` and
// `global-error.tsx`, and forward the captured error in each.

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        {error.digest ? `Reference: ${error.digest}` : 'An unexpected error occurred.'}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
      >
        Try again
      </button>
    </div>
  );
}
