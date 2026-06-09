'use client';

// Global error boundary — replaces the root layout when an error escapes
// every nested boundary, so this file is responsible for rendering its own
// <html> and <body>. Required by App Router + @sentry/nextjs to avoid the
// Pages-Router `<Html>` import fallback at build time.

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <h2 className="text-2xl font-semibold">Application error</h2>
        <p className="text-sm opacity-70">
          {error.digest ? `Reference: ${error.digest}` : 'A fatal error occurred.'}
        </p>
      </body>
    </html>
  );
}
