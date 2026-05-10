import { boolean, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { trips } from './trips.js';

export const checklistCategoryEnum = pgEnum('checklist_category', [
  'clothing',
  'documents',
  'electronics',
  'toiletries',
  'essentials',
  'other',
]);

export const checklists = pgTable('checklists', {
  id: uuid('id').defaultRandom().primaryKey(),
  tripId: uuid('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' }),
  item: text('item').notNull(),
  category: checklistCategoryEnum('category').default('other').notNull(),
  isPacked: boolean('is_packed').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
