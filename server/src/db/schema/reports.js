import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const reportStatusEnum = pgEnum('report_status', ['pending', 'reviewed', 'resolved', 'dismissed']);

export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  reportedBy: uuid('reported_by').references(() => users.id).notNull(),
  entityType: text('entity_type').notNull(), // 'trip', 'user', 'activity'
  entityId: uuid('entity_id').notNull(),
  reason: text('reason').notNull(),
  status: reportStatusEnum('status').default('pending').notNull(),
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
