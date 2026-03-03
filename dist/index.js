import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { loadEnv } from './env.js';
import { apiKeyAuth } from './auth.js';
import { handleMcpRequest } from './mcp.js';
import { executeListTodos } from './tools/listTodos.js';
loadEnv();
const app = new Hono();
app.use('*', logger());
app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'x-api-key']
}));
app.get('/health', async (c) => {
    try {
        return c.json({
            status: 'ok',
            tools: 6,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('[todo-mcp-server] /health error:', error);
        return c.json({
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
});
app.get('/.well-known/mcp', async (c) => {
    try {
        return c.json({
            name: 'todo-mcp-server',
            version: '1.0.0',
            transport: 'http',
            endpoint: '/mcp'
        });
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('[todo-mcp-server] /.well-known/mcp error:', error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
});
app.get('/', (c) => {
    return c.html(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Todo MCP Server</title>
    <style>
      :root {
        --bg: #f3f7fb;
        --card: #ffffff;
        --text: #0f172a;
        --muted: #475569;
        --accent: #0f766e;
        --border: #dbe4ee;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Avenir Next", "Segoe UI", sans-serif;
        background: radial-gradient(circle at top, #e8f4ff, var(--bg) 45%);
        color: var(--text);
      }
      .wrap { max-width: 900px; margin: 40px auto; padding: 0 16px; }
      .card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
      }
      h1 { margin: 0 0 8px; font-size: 28px; }
      p { margin: 0; color: var(--muted); }
      .row { display: flex; gap: 8px; margin: 16px 0; }
      button {
        border: 0;
        border-radius: 10px;
        background: var(--accent);
        color: white;
        padding: 10px 14px;
        cursor: pointer;
        font-weight: 600;
      }
      #status { color: var(--muted); margin: 8px 0 12px; font-size: 14px; }
      table { width: 100%; border-collapse: collapse; }
      th, td {
        text-align: left;
        border-top: 1px solid var(--border);
        padding: 10px 8px;
        vertical-align: top;
      }
      th { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
      .chip {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 12px;
        border: 1px solid var(--border);
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <h1>Todo MCP Server</h1>
        <p>Browser view for your local todo database.</p>
        <div class="row">
          <button id="refresh">Refresh</button>
        </div>
        <div id="status">Loading...</div>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Due</th>
            </tr>
          </thead>
          <tbody id="rows"></tbody>
        </table>
      </div>
    </div>
    <script>
      const status = document.getElementById('status');
      const rows = document.getElementById('rows');
      const refreshBtn = document.getElementById('refresh');

      function safe(value) {
        return String(value ?? '').replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
      }

      async function loadTodos() {
        status.textContent = 'Loading...';
        try {
          const res = await fetch('/api/todos');
          const payload = await res.json();

          if (!payload.success) {
            status.textContent = 'Error: ' + (payload.error || 'Failed to fetch todos');
            rows.innerHTML = '';
            return;
          }

          const list = Array.isArray(payload.data) ? payload.data : [];
          if (list.length === 0) {
            status.textContent = 'No todos found.';
            rows.innerHTML = '';
            return;
          }

          rows.innerHTML = list.map((todo) => \`
            <tr>
              <td>\${safe(todo.title)}</td>
              <td><span class="chip">\${safe(todo.status)}</span></td>
              <td><span class="chip">\${safe(todo.priority)}</span></td>
              <td>\${safe(todo.dueDate || '-')}</td>
            </tr>
          \`).join('');
          status.textContent = \`Loaded \${list.length} item(s)\`;
        } catch (err) {
          status.textContent = 'Error: ' + (err?.message || 'Unknown error');
          rows.innerHTML = '';
        }
      }

      refreshBtn.addEventListener('click', loadTodos);
      loadTodos();
    </script>
  </body>
</html>`);
});
app.get('/api/todos', async (c) => {
    const status = c.req.query('status');
    const priority = c.req.query('priority');
    const limitValue = c.req.query('limit');
    const limit = limitValue ? Number(limitValue) : undefined;
    const normalizedLimit = limit !== undefined && Number.isFinite(limit) ? limit : 20;
    return c.json(await executeListTodos({
        status: status === 'pending' ||
            status === 'completed' ||
            status === 'archived'
            ? status
            : undefined,
        priority: priority === 'low' ||
            priority === 'medium' ||
            priority === 'high'
            ? priority
            : undefined,
        limit: normalizedLimit
    }));
});
app.use('*', async (c, next) => {
    const path = c.req.path;
    if (path === '/health' ||
        path === '/.well-known/mcp' ||
        path === '/' ||
        path === '/api/todos') {
        await next();
        return;
    }
    return await apiKeyAuth(c, next);
});
app.post('/mcp', async (c) => {
    try {
        return await handleMcpRequest(c.req.raw);
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('[todo-mcp-server] /mcp error:', error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
});
app.all('/mcp', async (c) => {
    try {
        return c.json({
            success: false,
            error: 'Method Not Allowed'
        }, 405);
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('[todo-mcp-server] /mcp (non-POST) error:', error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
});
export default app;
