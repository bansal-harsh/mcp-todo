import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Context } from 'hono';
import { apiKeyAuth } from './auth.js';
import { createMcpTransport, mcpServer } from './mcp.js';

const app = new Hono();

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'x-api-key']
  })
);

app.get('/health', async (c: Context) => {
  try {
    return c.json({
      status: 'ok',
      tools: 6,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[todo-mcp-server] /health error:', error);
    return c.json(
      {
        status: 'error',
        error:
          error instanceof Error ? error.message : 'Unknown error'
      },
      500
    );
  }
});

app.get('/.well-known/mcp', async (c: Context) => {
  try {
    return c.json({
      name: 'todo-mcp-server',
      version: '1.0.0',
      transport: 'http',
      endpoint: '/mcp'
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      '[todo-mcp-server] /.well-known/mcp error:',
      error
    );
    return c.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error'
      },
      500
    );
  }
});

app.use('*', async (c, next) => {
  const path = c.req.path;
  if (path === '/health' || path === '/.well-known/mcp') {
    await next();
    return;
  }
  await apiKeyAuth(c, next);
});

app.post('/mcp', async (c: Context) => {
  try {
    const transport = createMcpTransport();

    const request = new Request(c.req.url, {
      method: c.req.method,
      headers: c.req.raw.headers,
      body: c.req.raw.body ?? null
    });

    const response = await transport.handleRequest(request);

    const textBody = await response.text();
    const headers = Object.fromEntries(response.headers.entries());

    return c.body(textBody, response.status, headers);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[todo-mcp-server] /mcp error:', error);
    return c.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error'
      },
      500
    );
  }
});

app.all('/mcp', async (c: Context) => {
  try {
    return c.json(
      {
        success: false,
        error: 'Method Not Allowed'
      },
      405
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      '[todo-mcp-server] /mcp (non-POST) error:',
      error
    );
    return c.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error'
      },
      500
    );
  }
});

void mcpServer;

export default app;

