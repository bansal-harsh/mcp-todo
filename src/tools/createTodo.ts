import { z } from 'zod';
import { nanoid } from 'nanoid';
import { getDb } from '../db/client.js';
import { todos, type TodoPriority, type TodoStatus } from '../db/schema.js';

export const createTodoInputSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional(),
  priority: z
    .enum(['low', 'medium', 'high'])
    .default('medium')
    .transform((value): TodoPriority => value),
  due_date: z
    .string()
    .datetime()
    .optional()
});

export type CreateTodoInput = z.infer<typeof createTodoInputSchema>;

export type ToolResult = {
  success: boolean;
  data?: unknown;
  error?: string;
};

export async function executeCreateTodo(
  input: CreateTodoInput
): Promise<ToolResult> {
  try {
    const parsed = createTodoInputSchema.parse(input);
    const db = getDb();

    const now = new Date().toISOString();
    const id = nanoid();

    const [inserted] = await db
      .insert(todos)
      .values({
        id,
        title: parsed.title,
        description: parsed.description ?? null,
        status: 'pending' as TodoStatus,
        priority: parsed.priority,
        dueDate: parsed.due_date ?? null,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return {
      success: true,
      data: inserted
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

