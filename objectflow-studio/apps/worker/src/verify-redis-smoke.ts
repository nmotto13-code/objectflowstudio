// Smoke-test Redis connectivity. Load env before importing anything that touches it.
import { config } from 'dotenv';
import { resolve } from 'node:path';
config({ path: resolve(process.cwd(), '../../.env.local') });

import { Redis } from 'ioredis';

const url = process.env.REDIS_URL;
if (!url) throw new Error('REDIS_URL not set');

const redis = new Redis(url, { maxRetriesPerRequest: 3 });

try {
  const pong = await redis.ping();
  console.log('PING ->', pong);

  const key = 'objectflow:smoke:' + Date.now();
  await redis.set(key, 'hello', 'EX', 60);
  const value = await redis.get(key);
  console.log('SET/GET ->', value);
  await redis.del(key);

  const info = await redis.info('server');
  const version = info.match(/redis_version:([^\r\n]+)/)?.[1];
  console.log('Redis version:', version);

  console.log('OK');
} finally {
  redis.disconnect();
}
