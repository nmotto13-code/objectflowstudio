// Intentional throw to smoke-test server-side Sentry capture from a route.
// Hitting /debug-sentry should produce an issue in the Sentry dashboard.

export const dynamic = 'force-dynamic';

export default function DebugSentry() {
  throw new Error('Web Sentry smoke test — intentional error (server component)');
}
