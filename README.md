# mcp-postgres-typescript

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for PostgreSQL. The `postgres_query` tool lets MCP clients (e.g. Cursor) run **one** SQL statement per invocation.

**Default mode: read-only.** Commands such as `INSERT`, `UPDATE`, `DELETE`, and DDL are not executed unless you enable the corresponding environment variables (see below).

## Requirements

- Node.js **≥ 20**

Communication uses **stdio** (not HTTP). PostgreSQL credentials and options are set via environment variables in your MCP configuration (`env`) or on the system.

## Install in Cursor

1. Open **Settings → MCP**, or edit the `mcp.json` file for your Cursor account.
2. Add a server entry like the example below.

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@achmadya-dev/mcp-postgres-typescript"],
      "env": {
        "PGHOST": "127.0.0.1",
        "PGUSER": "postgres",
        "PGPASSWORD": "password",
        "PGDATABASE": "mydb"
      }
    }
  }
}
```

Adjust the `env` values to match your PostgreSQL server.

## Manual setup from a cloned repository

```bash
git clone <repo-url> mcp-postgres-typescript
cd mcp-postgres-typescript
pnpm install && pnpm run build
```

Register the MCP server with **`node`** and the **absolute path** to `dist/index.js`:

```json
{
  "mcpServers": {
    "postgres": {
      "command": "node",
      "args": ["C:/Users/Username/projects/mcp-postgres-typescript/dist/index.js"],
      "env": {
        "PGHOST": "127.0.0.1",
        "PGUSER": "postgres",
        "PGPASSWORD": "password",
        "PGDATABASE": "mydb"
      }
    }
  }
}
```

Replace the path in `args` with your clone location. After changing TypeScript sources, run `pnpm run build` again.

## Environment variables

### Connection (libpq convention)

| Variable     | Default                  | Description                                   |
| ------------ | ------------------------ | --------------------------------------------- |
| `PGHOST`     | `127.0.0.1`              | PostgreSQL host                               |
| `PGPORT`     | `5432`                   | Port                                          |
| `PGUSER`     | `postgres`               | Username                                      |
| `PGPASSWORD` | _(unset = empty string)_ | Password                                      |
| `PGDATABASE` | _(optional)_             | Database name                                 |
| `PG_MAX_ROWS`| `500`                    | Max rows returned for row-returning queries   |

### Allowing write operations

**Read** commands (`SELECT`, `WITH`, `EXPLAIN`, `TABLE`, `VALUES`, and similar read patterns) are always allowed.

To allow **writes** or **DDL**, enable the variables below. Values treated as enabled: `true`, `1`, `yes`, or `on` (case-insensitive).

| Variable                 | Allows                             |
| ------------------------ | ---------------------------------- |
| `ALLOW_INSERT_OPERATION` | `INSERT`                           |
| `ALLOW_UPDATE_OPERATION` | `UPDATE`                           |
| `ALLOW_DELETE_OPERATION` | `DELETE`                           |
| `ALLOW_DDL_OPERATION`    | DDL (`CREATE`, `ALTER`, `DROP`, etc.) |

If a variable is unset or its value is not one of the above, that operation type is **rejected**.

## Other behavior

- Each request must contain **one** SQL statement only (no multiple statements separated by `;`).
- Row-returning query results are returned as columnar text; row count is capped by `PG_MAX_ROWS`.
