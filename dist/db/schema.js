import { pgTable, text } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
export const todos = pgTable('todos', {
    id: text('id')
        .primaryKey()
        .notNull(),
    title: text('title')
        .notNull(),
    description: text('description'),
    status: text('status')
        .notNull()
        .$type()
        .default('pending'),
    priority: text('priority')
        .notNull()
        .$type()
        .default('medium'),
    dueDate: text('due_date'),
    createdAt: text('created_at')
        .notNull()
        .default(sql `CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
        .notNull()
        .default(sql `CURRENT_TIMESTAMP`)
});
