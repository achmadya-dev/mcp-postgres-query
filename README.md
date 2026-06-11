# mcp-postgres-query

Model Context Protocol (MCP) server for PostgreSQL to run SQL queries via stdio (read-only by default). It lets MCP clients run a single SQL statement per invocation.

**Default mode: read-only.** Commands such as `INSERT`, `UPDATE`, `DELETE`, and DDL are not executed unless you enable the corresponding environment variables (see below).

## Requirements

- Node.js **≥ 20**

Communication uses **stdio** (not HTTP). PostgreSQL credentials and options are set via environment variables in your MCP configuration (`env`) or on the system.

## Install in MCP Clients (e.g. Cursor)

1. Open **Settings → MCP**, or edit the `mcp.json` file for your Cursor account.
2. Add a server entry like the example below.

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@achmadya-dev/mcp-postgres-query"],
      "env": {
        "POSTGRES_HOST": "127.0.0.1",
        "POSTGRES_PORT": "5432",
        "POSTGRES_USER": "postgres",
        "POSTGRES_PASSWORD": "password",
        "POSTGRES_DATABASE": "mydb"
      }
    }
  }
}
```

Adjust the `env` values to match your PostgreSQL server.

## Manual setup from a cloned repository

```bash
git clone <repo-url> mcp-postgres-query
cd mcp-postgres-query
pnpm install && pnpm run build
```

Register the MCP server with **`node`** and the **absolute path** to `dist/index.js`:

```json
{
  "mcpServers": {
    "postgres": {
      "command": "node",
      "args": ["C:/Users/Username/projects/mcp-postgres-query/dist/index.js"],
      "env": {
        "POSTGRES_HOST": "127.0.0.1",
        "POSTGRES_PORT": "5432",
        "POSTGRES_USER": "postgres",
        "POSTGRES_PASSWORD": "password",
        "POSTGRES_DATABASE": "mydb"
      }
    }
  }
}
```

Replace the path in `args` with your clone location. After changing TypeScript sources, run `pnpm run build` again.

## Environment variables

### Connection

| Variable              | Default                  | Description                                 |
| --------------------- | ------------------------ | ------------------------------------------- |
| `POSTGRES_HOST`       | `127.0.0.1`              | PostgreSQL host                             |
| `POSTGRES_PORT`       | `5432`                   | Port                                        |
| `POSTGRES_USER`       | _(unset = empty string)_ | Username                                    |
| `POSTGRES_PASSWORD`   | _(unset = empty string)_ | Password                                    |
| `POSTGRES_DATABASE`   | _(optional)_             | Locks the server to this database when set    |
| `POSTGRES_MAX_ROWS`   | `500`                    | Max rows returned for row-returning queries |

### Allowing write operations

**Read** commands (`SELECT`, `EXPLAIN`, `TABLE`, `VALUES`, `SHOW`) are always allowed.

To allow **writes** or **DDL**, enable the variables below. Values treated as enabled: `true`, `1`, `yes`, or `on` (case-insensitive).

| Variable                 | Allows                                  |
| ------------------------ | --------------------------------------- |
| `ALLOW_INSERT_OPERATION` | `INSERT`                                |
| `ALLOW_UPDATE_OPERATION` | `UPDATE`                                |
| `ALLOW_DELETE_OPERATION` | `DELETE`                                |
| `ALLOW_DDL_OPERATION`    | DDL (`CREATE`, `ALTER`, `DROP`, etc.)   |

If a variable is unset or its value is not one of the above, that operation type is **rejected**.

## Tool parameters

Every tool accepts:

| Parameter   | Required | Description |
| ----------- | -------- | ----------- |
| `sql`       | yes      | A single SQL statement |
| `database`  | depends  | Required when `POSTGRES_DATABASE` is **not** set. Ignored when `POSTGRES_DATABASE` **is** set (server locked to that database). |

**When `POSTGRES_DATABASE` is set** (e.g. `riset`): all queries use that database only. Use `schema.table` in `sql` for other schemas within the same database.

**When `POSTGRES_DATABASE` is not set**: pass `database` on each query to choose the target database.

Example without `POSTGRES_DATABASE` in server config:

```json
{
  "sql": "SELECT datname FROM pg_database",
  "database": "postgres"
}
```

## Other behavior

- Each request must contain **one** SQL statement only (no multiple statements separated by `;`).
- Results are returned as **JSON** text in the tool response.
- Row-returning queries include `columns`, `rows`, `rowCount`, `totalRows`, `truncated`, and `maxRows`; row count is capped by `POSTGRES_MAX_ROWS`.
- Non-row commands (e.g. `INSERT`, `UPDATE`) return `kind: "execute"` with `affectedRows`.
