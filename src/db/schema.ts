import { pgTable, text } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export type TodoStatus = 'pending' | 'completed' | 'archived';
export type TodoPriority = 'low' | 'medium' | 'high';

export const todos = pgTable('todos', {
  id: text('id')
    .primaryKey()
    .notNull(),
  title: text('title')
    .notNull(),
  description: text('description'),
  status: text('status')
    .notNull()
    .$type<TodoStatus>()
    .default('pending'),
  priority: text('priority')
    .notNull()
    .$type<TodoPriority>()
    .default('medium'),
  dueDate: text('due_date'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
});

export type Todo = {
  id: string;
  title: string;
  description: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

