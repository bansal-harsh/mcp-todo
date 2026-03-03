import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/client.js';
import { todos } from '../db/schema.js';
export const updateTodoInputSchema = z
    .object({
    id: z.string().min(1, 'id is required.'),
    title: z.string().optional(),
    description: z.string().optional(),
    status: z
        .enum(['pending', 'completed', 'archived'])
        .optional()
        .transform((value) => value),
    priority: z
        .enum(['low', 'medium', 'high'])
        .optional()
        .transform((value) => value),
    due_date: z
        .string()
        .datetime()
        .optional()
})
    .refine((value) => value.title !== undefined ||
    value.description !== undefined ||
    value.status !== undefined ||
    value.priority !== undefined ||
    value.due_date !== undefined, {
    message: 'At least one field to update must be provided.',
    path: []
});
export async function executeUpdateTodo(input) {
    try {
        const parsed = updateTodoInputSchema.parse(input);
        const db = getDb();
        const now = new Date().toISOString();
        const updateValues = {
            updatedAt: now
        };
        if (parsed.title !== undefined) {
            updateValues.title = parsed.title;
        }
        if (parsed.description !== undefined) {
            updateValues.description = parsed.description ?? null;
        }
        if (parsed.status !== undefined) {
            updateValues.status = parsed.status;
        }
        if (parsed.priority !== undefined) {
            updateValues.priority = parsed.priority;
        }
        if (parsed.due_date !== undefined) {
            updateValues.dueDate = parsed.due_date ?? null;
        }
        const [updated] = await db
            .update(todos)
            .set(updateValues)
            .where(eq(todos.id, parsed.id))
            .returning();
        if (!updated) {
            return {
                success: false,
                error: `Todo with id "${parsed.id}" not found.`
            };
        }
        return {
            success: true,
            data: updated
        };
    }
    catch (error) {
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
