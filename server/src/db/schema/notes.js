import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { trips } from './trips.js';
import { stops } from './stops.js';

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  tripId: uuid('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' }),
  stopId: uuid('stop_id').references(() => stops.id, { onDelete: 'cascade' }),

  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
