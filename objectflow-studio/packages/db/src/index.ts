export { getDb, closeDb, type Db } from './client.js';
export * as schema from './schema/index.js';

// Re-export common drizzle helpers so consumers don't need a direct dep.
export { sql, eq, and, or, not, asc, desc } from 'drizzle-orm';
