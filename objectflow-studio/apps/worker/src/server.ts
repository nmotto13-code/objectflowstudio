// MUST be first — populates process.env from .env.local before any module
// (like @objectflow/config) reads env vars.
import './load-env.js';
// MUST be second — Sentry must initialize before Fastify/http modules so it
// can install its automatic instrumentation hooks.
import { Sentry } from './sentry.js';
// MUST be third — OpenTelemetry + Anthropic auto-instrumentation for Langfuse,
// before any module imports/uses the Anthropic SDK.
import './telemetry.js';

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { serve } from 'inngest/edge';
import { env } from '@objectflow/config';
import { inngest, inngestFunctions } from './inngest/client.js';
import { getDb, sql } from '@objectflow/db';

const app = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
  bodyLimit: 10 * 1024 * 1024,
});

await app.register(helmet);
await app.register(cors, { origin: true });

// Forward any unhandled Fastify error to Sentry with the request context.
app.setErrorHandler((err, req, reply) => {
  Sentry.captureException(err, { tags: { route: req.routeOptions?.url ?? req.url } });
  app.log.error(err);
  reply.status(500).send({ ok: false, error: err.message });
});

app.get('/health', async () => ({
  ok: true,
  service: 'worker',
  timestamp: new Date().toISOString(),
}));

// Intentional throw for smoke-testing Sentry. Curl it to verify reports land.
app.get('/debug-sentry', async () => {
  throw new Error('Worker Sentry smoke test — intentional error');
});

app.get('/health/db', async (_req, reply) => {
  try {
    const db = getDb();
    const rows = await db.execute(sql`SELECT now() AS now, version() AS version`);
    const row = rows[0] as { now: Date; version: string } | undefined;
    return { ok: true, service: 'db', now: row?.now, version: row?.version };
  } catch (err) {
    reply.code(500);
    return {
      ok: false,
      service: 'db',
      error: err instanceof Error ? err.message : 'unknown',
    };
  }
});

/**
 * Inngest's Fastify adapter (`inngest/fastify`) is broken in 3.54.2 — `req`
 * is undefined inside the headers callback. We use the framework-agnostic
 * `inngest/edge` handler (takes a Fetch-style Request, returns Response) and
 * adapt Fastify's raw req/reply to it ourselves. Works against any version.
 */
const inngestHandler = serve({
  client: inngest,
  functions: inngestFunctions,
  servePath: '/api/inngest',
});

app.all('/api/inngest', async (req, reply) => {
  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) headers.set(k, v.join(', '));
    else if (typeof v === 'string') headers.set(k, v);
  }
  const init: RequestInit = {
    method: req.method,
    headers,
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = JSON.stringify(req.body ?? {});
    if (!headers.has('content-type')) headers.set('content-type', 'application/json');
  }
  const response = await inngestHandler(new Request(url.toString(), init));
  reply.status(response.status);
  response.headers.forEach((value, key) => reply.header(key, value));
  const body = await response.text();
  return reply.send(body);
});

const port = Number(process.env.PORT ?? 4000);
const host = '0.0.0.0';

try {
  await app.listen({ port, host });
  app.log.info(`worker listening on http://${host}:${port}`);
  app.log.info(
    `env check: ANTHROPIC_API_KEY=${env.ANTHROPIC_API_KEY ? 'set(' + env.ANTHROPIC_API_KEY.slice(0, 20) + '...)' : 'MISSING'}, INNGEST_EVENT_KEY=${env.INNGEST_EVENT_KEY ? 'set' : 'MISSING'}, DATABASE_URL=${env.DATABASE_URL ? 'set' : 'MISSING'}`,
  );
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
