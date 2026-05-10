import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { trips } from './trips.js';

export const aiChatRoleEnum = pgEnum('ai_chat_role', ['user', 'assistant']);

export const aiChats = pgTable('ai_chats', {
  id: uuid('id').defaultRandom().primaryKey(),
  tripId: uuid('trip_id')
    .notNull()
    .unique()
    .references(() => trips.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const aiChatMessages = pgTable('ai_chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  chatId: uuid('chat_id')
    .notNull()
    .references(() => aiChats.id, { onDelete: 'cascade' }),
  role: aiChatRoleEnum('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});