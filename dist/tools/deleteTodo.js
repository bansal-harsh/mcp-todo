import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/client.js';
import { todos } from '../db/schema.js';
export const deleteTodoInputSchema = z.object({
    id: z.string().min(1, 'id is required.')
});
export async function executeDeleteTodo(input) {
    try {
        const parsed = deleteTodoInputSchema.parse(input);
        const db = getDb();
        const [deleted] = await db
            .delete(todos)
            .where(eq(todos.id, parsed.id))
            .returning({ id: todos.id });
        if (!deleted) {
            return {
                success: false,
                error: `Todo with id "${parsed.id}" not found.`
            };
        }
        return {
            success: true,
            data: {
                deleted_id: deleted.id
            }
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
