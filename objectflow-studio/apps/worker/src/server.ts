import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { serve } from 'inngest/fastify';
import { env } from '@objectflow/config';
import { inngest, inngestFunctions } from './inngest/client.js';
import { getDb, sql } from '@objectflow/db';

const app = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

await app.register(helmet);
await app.register(cors, { origin: true });

app.get('/health', async () => ({
  ok: true,
  service: 'worker',
  timestamp: new Date().toISOString(),
}));

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

await app.register(
  // @ts-expect-error inngest fastify types lag behind v5
  serve({
    client: inngest,
    functions: inngestFunctions,
  }),
  { prefix: '/api/inngest' },
);

const port = Number(process.env.PORT ?? 4000);
const host = '0.0.0.0';

try {
  await app.listen({ port, host });
  app.log.info(`worker listening on http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
