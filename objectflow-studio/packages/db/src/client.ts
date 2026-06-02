import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@objectflow/config';
import * as schema from './schema/index.js';

let _client: ReturnType<typeof postgres> | undefined;
let _db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export type Db = ReturnType<typeof drizzle<typeof schema>>;

export function getDb(): Db {
  if (!_db) {
    _client = postgres(env.DATABASE_URL, {
      max: env.NODE_ENV === 'production' ? 10 : 5,
      prepare: false,
    });
    _db = drizzle(_client, { schema });
  }
  return _db;
}

export async function closeDb(): Promise<void> {
  if (_client) {
    await _client.end();
    _client = undefined;
    _db = undefined;
  }
}
