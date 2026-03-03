import { z } from 'zod';
import { inArray } from 'drizzle-orm';
import { getDb } from '../db/client.js';
import { todos, type TodoStatus } from '../db/schema.js';

export const bulkCompleteInputSchema = z.object({
  ids: z
    .array(z.string().min(1))
    .min(1)
    .max(50)
});

export type BulkCompleteInput = z.infer<typeof bulkCompleteInputSchema>;

export type ToolResult = {
  success: boolean;
  data?: unknown;
  error?: string;
};

export async function executeBulkComplete(
  input: BulkCompleteInput
): Promise<ToolResult> {
  try {
    const parsed = bulkCompleteInputSchema.parse(input);
    const db = getDb();

    const now = new Date().toISOString();

    const updated = await db
      .update(todos)
      .set({
        status: 'completed' as TodoStatus,
        updatedAt: now
      })
      .where(inArray(todos.id, parsed.ids))
      .returning({ id: todos.id });

    return {
      success: true,
      data: {
        updated_count: updated.length,
        updated_ids: updated.map((row) => row.id)
      }
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

