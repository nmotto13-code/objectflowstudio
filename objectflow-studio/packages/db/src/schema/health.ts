import { pgTable, serial, timestamp, text } from 'drizzle-orm/pg-core';

/**
 * L0 sentinel table — proves migrations + connection. Replaced/extended in L1.
 */
export const _health = pgTable('_health', {
  id: serial('id').primaryKey(),
  note: text('note').notNull().default('ok'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
