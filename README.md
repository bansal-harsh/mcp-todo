# todo-mcp-server

This project is a **production-ready MCP (Model Context Protocol) server** for a To-Do application, implemented in **TypeScript** and deployable as a **Vercel serverless function**.

The server uses **Hono** for HTTP routing, **Neon Postgres** with **Drizzle ORM** for persistence, and exposes MCP tools over **Streamable HTTP** on `POST /mcp`. It is designed to be consumed by MCP-compatible clients such as **Claude Desktop**.

## 1. Overview

This server exposes a set of MCP tools to create, list, retrieve, update, delete, and bulk-complete to-do items. Each tool is backed by a Postgres `todos` table and validated with **Zod**.

## 2. Prerequisites

- Node.js 20.x
- npm (included with Node 20)
- Neon Postgres account and database
- Vercel account (for deployment)
- GitHub account (for CI/CD with Vercel)

## 3. Local Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-user/todo-mcp-server.git
   cd todo-mcp-server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

   - Set `DATABASE_URL` to your Neon connection string (with `sslmode=require`).
   - Optionally set `MCP_API_KEY` to a secret for local auth (or leave empty to disable auth in dev).

4. Run database migrations (schema push):

   ```bash
   npm run db:push
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

   Endpoints:
   - `GET /health`
   - `GET /.well-known/mcp`
   - `POST /mcp` (for MCP clients)

## 4. Environment Variables

| Name          | Required | Description                                                                                           |
| ------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | Yes      | Postgres connection string for Neon (e.g. `postgres://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`). |
| `MCP_API_KEY`  | No       | API key required in `x-api-key`. If omitted, auth is disabled (dev mode, logs a warning).           |

## 5. Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project into Vercel and connect the GitHub repo.
3. Add `DATABASE_URL` and `MCP_API_KEY` in Vercel project settings.
4. Push to `main` to trigger a deploy.
5. Verify:

   ```bash
   curl https://your-project.vercel.app/health
   curl https://your-project.vercel.app/.well-known/mcp
   ```

## 6. Connect to Claude Desktop

Add this to your Claude MCP configuration (e.g. `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "todo": {
      "url": "https://YOUR-PROJECT.vercel.app/mcp",
      "headers": { "x-api-key": "your-key" }
    }
  }
}
```

- Replace `YOUR-PROJECT` with your Vercel domain.
- Replace `"your-key"` with your `MCP_API_KEY` value.

## 7. Available Tools

All tools return either `{ "success": true, "data": ... }` or `{ "success": false, "error": "message" }`.

| Tool Name       | Description                                 | Input Parameters                                                                                                                                                                                |
| --------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create_todo`   | Create a new to-do item.                   | `title` (string, required), `description` (string, optional), `priority` (`"low" \| "medium" \| "high"`, optional, default `"medium"`), `due_date` (ISO 8601 string, optional).                |
| `list_todos`    | List to-dos with optional filters.         | `status` (`"pending" \| "completed" \| "archived"`, optional), `priority` (`"low" \| "medium" \| "high"`, optional), `limit` (number 1–100, optional, default 20).                             |
| `get_todo`      | Get a single to-do by id.                  | `id` (string, required).                                                                                                                                                                        |
| `update_todo`   | Update fields of an existing to-do.        | `id` (string, required), plus at least one of: `title`, `description`, `status` (`"pending" \| "completed" \| "archived"`), `priority` (`"low" \| "medium" \| "high"`), `due_date` (ISO 8601). |
| `delete_todo`   | Delete a to-do by id.                      | `id` (string, required).                                                                                                                                                                        |
| `bulk_complete` | Mark multiple to-dos as completed at once. | `ids` (array of strings, required, length 1–50).                                                                                                                                                |

## 8. API Endpoints

- `GET /health` — no auth, returns `{ status, tools, timestamp }`.
- `GET /.well-known/mcp` — no auth, returns MCP metadata `{ name, version, transport, endpoint }`.
- `POST /mcp` — MCP Streamable HTTP endpoint, requires `x-api-key` if `MCP_API_KEY` is set.
- `ALL /mcp` (non-POST) — returns `405 Method Not Allowed`.

## 9. Database Migrations

- Schema file: `src/db/schema.ts`
- Config: `drizzle.config.ts`

### Running

```bash
npm run db:push
npm run db:studio
```
runs on http://localhost:3000/

