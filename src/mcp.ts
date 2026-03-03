import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamable-http-server-transport.js';
import type { JSONSchema4 } from 'json-schema';
import {
  createTodoInputSchema,
  executeCreateTodo
} from './tools/createTodo.js';
import {
  listTodosInputSchema,
  executeListTodos
} from './tools/listTodos.js';
import {
  getTodoInputSchema,
  executeGetTodo
} from './tools/getTodo.js';
import {
  updateTodoInputSchema,
  executeUpdateTodo
} from './tools/updateTodo.js';
import {
  deleteTodoInputSchema,
  executeDeleteTodo
} from './tools/deleteTodo.js';
import {
  bulkCompleteInputSchema,
  executeBulkComplete
} from './tools/bulkComplete.js';

type ZodSchema = z.ZodType<unknown>;

function zodToJsonSchema(schema: ZodSchema): JSONSchema4 {
  const shape =
    schema instanceof z.ZodObject ? schema.shape : undefined;

  if (!shape) {
    return { type: 'object' };
  }

  const properties: Record<string, JSONSchema4> = {};
  const required: string[] = [];

  for (const [key, value] of Object.entries(shape)) {
    if (value instanceof z.ZodString) {
      properties[key] = { type: 'string' };
    } else if (value instanceof z.ZodNumber) {
      properties[key] = { type: 'number' };
    } else if (value instanceof z.ZodEnum) {
      properties[key] = {
        type: 'string',
        enum: (value as z.ZodEnum<[string, ...string[]]>)._def
          .values as string[]
      };
    } else if (value instanceof z.ZodArray) {
      properties[key] = { type: 'array' };
    } else if (value instanceof z.ZodOptional) {
      properties[key] = { type: 'string' };
    } else {
      properties[key] = {};
    }

    if (!value.isOptional()) {
      required.push(key);
    }
  }

  return {
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined
  };
}

export const mcpServer = new McpServer({
  name: 'todo-mcp-server',
  version: '1.0.0'
});

mcpServer.tool(
  'create_todo',
  zodToJsonSchema(createTodoInputSchema),
  async (args: unknown) => {
    try {
      const result = await executeCreateTodo(
        args as Record<string, unknown>
      );

      if (result.success) {
        return {
          content: [
            {
              type: 'json',
              json: result.data
            }
          ]
        };
      }

      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: result.error ?? 'Unknown error'
          }
        ]
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text:
              error instanceof Error
                ? error.message
                : 'Unknown error'
          }
        ]
      };
    }
  }
);

mcpServer.tool(
  'list_todos',
  zodToJsonSchema(listTodosInputSchema),
  async (args: unknown) => {
    try {
      const result = await executeListTodos(
        args as Record<string, unknown>
      );

      if (result.success) {
        return {
          content: [
            {
              type: 'json',
              json: result.data
            }
          ]
        };
      }

      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: result.error ?? 'Unknown error'
          }
        ]
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text:
              error instanceof Error
                ? error.message
                : 'Unknown error'
          }
        ]
      };
    }
  }
);

mcpServer.tool(
  'get_todo',
  zodToJsonSchema(getTodoInputSchema),
  async (args: unknown) => {
    try {
      const result = await executeGetTodo(
        args as Record<string, unknown>
      );

      if (result.success) {
        return {
          content: [
            {
              type: 'json',
              json: result.data
            }
          ]
        };
      }

      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: result.error ?? 'Unknown error'
          }
        ]
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text:
              error instanceof Error
                ? error.message
                : 'Unknown error'
          }
        ]
      };
    }
  }
);

mcpServer.tool(
  'update_todo',
  zodToJsonSchema(updateTodoInputSchema),
  async (args: unknown) => {
    try {
      const result = await executeUpdateTodo(
        args as Record<string, unknown>
      );

      if (result.success) {
        return {
          content: [
            {
              type: 'json',
              json: result.data
            }
          ]
        };
      }

      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: result.error ?? 'Unknown error'
          }
        ]
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text:
              error instanceof Error
                ? error.message
                : 'Unknown error'
          }
        ]
      };
    }
  }
);

mcpServer.tool(
  'delete_todo',
  zodToJsonSchema(deleteTodoInputSchema),
  async (args: unknown) => {
    try {
      const result = await executeDeleteTodo(
        args as Record<string, unknown>
      );

      if (result.success) {
        return {
          content: [
            {
              type: 'json',
              json: result.data
            }
          ]
        };
      }

      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: result.error ?? 'Unknown error'
          }
        ]
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text:
              error instanceof Error
                ? error.message
                : 'Unknown error'
          }
        ]
      };
    }
  }
);

mcpServer.tool(
  'bulk_complete',
  zodToJsonSchema(bulkCompleteInputSchema),
  async (args: unknown) => {
    try {
      const result = await executeBulkComplete(
        args as Record<string, unknown>
      );

      if (result.success) {
        return {
          content: [
            {
              type: 'json',
              json: result.data
            }
          ]
        };
      }

      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: result.error ?? 'Unknown error'
          }
        ]
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text:
              error instanceof Error
                ? error.message
                : 'Unknown error'
          }
        ]
      };
    }
  }
);

export function createMcpTransport(): StreamableHTTPServerTransport {
  return new StreamableHTTPServerTransport({
    server: mcpServer,
    path: '/mcp',
    sessionIdGenerator: undefined
  });
}

