import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
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

type ToolExecutionResult = {
  success: boolean;
  data?: unknown;
  error?: string;
};

function toStructuredContent(
  data: unknown
): Record<string, unknown> {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }

  return { result: data };
}

function toToolResponse(result: ToolExecutionResult) {
  if (result.success) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result.data ?? null)
        }
      ],
      structuredContent: toStructuredContent(result.data ?? null)
    };
  }

  return {
    isError: true,
    content: [
      {
        type: 'text' as const,
        text: result.error ?? 'Unknown error'
      }
    ]
  };
}

function getErrorResponse(error: unknown) {
  return {
    isError: true,
    content: [
      {
        type: 'text' as const,
        text: error instanceof Error ? error.message : 'Unknown error'
      }
    ]
  };
}

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'todo-mcp-server',
    version: '1.0.0'
  });

  server.registerTool(
    'create_todo',
    {
      description: 'Create a new todo item.',
      inputSchema: createTodoInputSchema.shape
    },
    async (args) => {
      try {
        return toToolResponse(await executeCreateTodo(args));
      } catch (error) {
        return getErrorResponse(error);
      }
    }
  );

  server.registerTool(
    'list_todos',
    {
      description: 'List todos with optional filters.',
      inputSchema: listTodosInputSchema.shape
    },
    async (args) => {
      try {
        return toToolResponse(await executeListTodos(args));
      } catch (error) {
        return getErrorResponse(error);
      }
    }
  );

  server.registerTool(
    'get_todo',
    {
      description: 'Get one todo by id.',
      inputSchema: getTodoInputSchema.shape
    },
    async (args) => {
      try {
        return toToolResponse(await executeGetTodo(args));
      } catch (error) {
        return getErrorResponse(error);
      }
    }
  );

  server.registerTool(
    'update_todo',
    {
      description: 'Update an existing todo item.',
      inputSchema: updateTodoInputSchema.shape
    },
    async (args) => {
      try {
        return toToolResponse(await executeUpdateTodo(args));
      } catch (error) {
        return getErrorResponse(error);
      }
    }
  );

  server.registerTool(
    'delete_todo',
    {
      description: 'Delete a todo by id.',
      inputSchema: deleteTodoInputSchema.shape
    },
    async (args) => {
      try {
        return toToolResponse(await executeDeleteTodo(args));
      } catch (error) {
        return getErrorResponse(error);
      }
    }
  );

  server.registerTool(
    'bulk_complete',
    {
      description: 'Complete multiple todos in one operation.',
      inputSchema: bulkCompleteInputSchema.shape
    },
    async (args) => {
      try {
        return toToolResponse(await executeBulkComplete(args));
      } catch (error) {
        return getErrorResponse(error);
      }
    }
  );

  return server;
}

export async function handleMcpRequest(
  request: Request
): Promise<Response> {
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });
  const server = createMcpServer();

  await server.connect(transport);
  return transport.handleRequest(request);
}
