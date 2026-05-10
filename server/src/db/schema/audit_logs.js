import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  adminId: uuid('admin_id').references(() => users.id).notNull(),
  action: text('action').notNull(), // e.g., "DELETE_TRIP", "BAN_USER"
  entityType: text('entity_type').notNull(), // e.g., "trip", "user"
  entityId: uuid('entity_id'),
  metadata: jsonb('metadata'), // e.g., { reason: "spam", originalName: "..." }
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
