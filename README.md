# @achmadya-dev/mcp-postgres-query

MCP server for PostgreSQL. Runs a single SQL statement per tool call over **stdio**. **Read-only by default** — writes and DDL require explicit env flags.

## Requirements

- Node.js **≥ 20**
- A reachable PostgreSQL server

## Install from npm

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@achmadya-dev/mcp-postgres-query"],
      "env": {
        "POSTGRES_HOST": "localhost",
        "POSTGRES_PORT": "5432",
        "POSTGRES_USER": "your_user",
        "POSTGRES_PASSWORD": "your_password",
        "POSTGRES_DATABASE": "your_database"
      }
    }
  }
}
```

Or use `envFile` instead of inline `env` (see [Cursor MCP docs](https://cursor.com/docs/mcp)).

## Develop from source

```bash
git clone https://github.com/achmadya-dev/mcp-postgres-query.git
cd mcp-postgres-query
pnpm install
pnpm run build
pnpm test
```

Open the repo root in Cursor. You need a reachable PostgreSQL instance — set connection env in `.cursor/mcp.json` or via `envFile`:

```json
{
  "mcpServers": {
    "postgres": {
      "command": "node",
      "args": ["${workspaceFolder}/dist/index.js"],
      "env": {
        "POSTGRES_HOST": "localhost",
        "POSTGRES_PORT": "5432",
        "POSTGRES_USER": "your_user",
        "POSTGRES_PASSWORD": "your_password",
        "POSTGRES_DATABASE": "your_database"
      }
    }
  }
}
```

## Environment variables

### Connection

| Variable            | Default      | Description                        |
| ------------------- | ------------ | ---------------------------------- |
| `POSTGRES_HOST`     | `localhost`  | PostgreSQL host                    |
| `POSTGRES_PORT`     | `5432`       | Port                               |
| `POSTGRES_USER`     | _(empty)_    | Username                           |
| `POSTGRES_PASSWORD` | _(empty)_    | Password                           |
| `POSTGRES_DATABASE` | _(optional)_ | Default database                   |
| `POSTGRES_MAX_ROWS` | `500`        | Max rows for row-returning queries |

### Write access

| Variable                 | Allows   |
| ------------------------ | -------- |
| `ALLOW_INSERT_OPERATION` | `INSERT` |
| `ALLOW_UPDATE_OPERATION` | `UPDATE` |
| `ALLOW_DELETE_OPERATION` | `DELETE` |
| `ALLOW_DDL_OPERATION`    | DDL      |

Enabled values: `true`, `1`, `yes`, `on`.

## Tools

| Tool              | Statements                                     | Env flag                 |
| ----------------- | ---------------------------------------------- | ------------------------ |
| `postgres_select` | `SELECT`, `EXPLAIN`, `TABLE`, `VALUES`, `SHOW` | always on                |
| `postgres_insert` | `INSERT`                                       | `ALLOW_INSERT_OPERATION` |
| `postgres_update` | `UPDATE`                                       | `ALLOW_UPDATE_OPERATION` |
| `postgres_delete` | `DELETE`                                       | `ALLOW_DELETE_OPERATION` |
| `postgres_ddl`    | DDL                                            | `ALLOW_DDL_OPERATION`    |

### Tool input

| Parameter  | Required | Description                                 |
| ---------- | -------- | ------------------------------------------- |
| `sql`      | yes      | Single SQL statement                        |
| `database` | no       | Overrides `POSTGRES_DATABASE` for this call |

Example:

```json
{
  "sql": "SELECT datname FROM pg_database",
  "database": "postgres"
}
```

Use `schema.table` in `sql` for other schemas in the same database.

## Behavior and security

- One statement per request.
- Results are JSON text with `columns`, `rows`, `rowCount`, `truncated`, `maxRows` for row-returning queries.
- Execute results return `kind: "execute"` with `affectedRows`.

## Package scripts

```bash
pnpm run build
pnpm test
pnpm start
```
