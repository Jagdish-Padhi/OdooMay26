import { integer, numeric, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { stops } from './stops.js';

export const activityTypeEnum = pgEnum('activity_type', [
  'sightseeing',
  'food',
  'transport',
  'adventure',
  'relaxation',
  'culture',
  'shopping',
  'other',
]);

export const activities = pgTable('activities', {
  id: uuid('id').defaultRandom().primaryKey(),
  stopId: uuid('stop_id')
    .notNull()
    .references(() => stops.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: activityTypeEnum('type').default('other').notNull(),
  cost: numeric('cost', { precision: 10, scale: 2 }).default('0').notNull(),
  duration: text('duration'),
  order: integer('order').notNull().default(1),

  notes: text('notes'),
  startTime: timestamp('start_time', { withTimezone: true }),
  endTime: timestamp('end_time', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
