import { z } from 'zod';
import { and, desc, eq, type SQL } from 'drizzle-orm';
import { getDb } from '../db/client.js';
import {
  todos,
  type TodoPriority,
  type TodoStatus
} from '../db/schema.js';

export const listTodosInputSchema = z.object({
  status: z
    .enum(['pending', 'completed', 'archived'])
    .optional()
    .transform((value): TodoStatus | undefined => value),
  priority: z
    .enum(['low', 'medium', 'high'])
    .optional()
    .transform((value): TodoPriority | undefined => value),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(20)
});

export type ListTodosInput = z.infer<typeof listTodosInputSchema>;

export type ToolResult = {
  success: boolean;
  data?: unknown;
  error?: string;
};

export async function executeListTodos(
  input: ListTodosInput
): Promise<ToolResult> {
  try {
    const parsed = listTodosInputSchema.parse(input);
    const db = getDb();

    const conditions: SQL<unknown>[] = [];

    if (parsed.status) {
      conditions.push(eq(todos.status, parsed.status));
    }
    if (parsed.priority) {
      conditions.push(eq(todos.priority, parsed.priority));
    }

    const whereClause =
      conditions.length === 0
        ? undefined
        : conditions.length === 1
          ? conditions[0]
          : and(...conditions);

    const results = await db.query.todos.findMany({
      where: whereClause,
      orderBy: desc(todos.createdAt),
      limit: parsed.limit
    });

    return {
      success: true,
      data: results
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation error: ${error.message}`
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
