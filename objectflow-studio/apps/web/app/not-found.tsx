// Custom 404 page for App Router. Without this Next.js synthesizes a default
// /404 from the Pages Router internals, which @sentry/nextjs v8's webpack
// wrapper instruments in a way that pulls `next/document` into the prerender
// chunk — breaking the build. Defining our own short-circuits that path.

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-2xl font-semibold">Page not found</h2>
      <p className="text-sm text-muted-foreground">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <Link
        href="/"
        className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
      >
        Back home
      </Link>
    </div>
  );
}
