import { integer, pgEnum, pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';

export const costIndexEnum = pgEnum('cost_index', ['low', 'medium', 'high']);

export const cities = pgTable('cities', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  country: text('country').notNull(),
  costIndex: costIndexEnum('cost_index').default('medium').notNull(),
  popularity: integer('popularity').default(0).notNull(),

  imageUrl: text('image_url'),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
