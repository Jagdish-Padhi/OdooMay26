import { integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { trips } from './trips.js';
import { cities } from './cities.js';

export const stops = pgTable('stops', {
  id: uuid('id').defaultRandom().primaryKey(),
  tripId: uuid('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' }),
  cityId: uuid('city_id')
    .notNull()
    .references(() => cities.id),
  arrivalDate: timestamp('arrival_date', { withTimezone: true }),
  departureDate: timestamp('departure_date', { withTimezone: true }),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
