import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/client.js';
import { todos } from '../db/schema.js';
export const getTodoInputSchema = z.object({
    id: z.string().min(1, 'id is required.')
});
export async function executeGetTodo(input) {
    try {
        const parsed = getTodoInputSchema.parse(input);
        const db = getDb();
        const result = await db.query.todos.findFirst({
            where: eq(todos.id, parsed.id)
        });
        if (!result) {
            return {
                success: false,
                error: `Todo with id "${parsed.id}" not found.`
            };
        }
        return {
            success: true,
            data: result
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
