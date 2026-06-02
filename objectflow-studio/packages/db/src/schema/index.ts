// L0 schema: only the _health table exists. Real tables land in L1+.
// Note: drizzle-kit ignores this index and reads ./src/schema/*.ts directly.
// This file exists so runtime imports (`import * as schema from './schema/index.js'`)
// resolve correctly under NodeNext.
export * from './health.js';
