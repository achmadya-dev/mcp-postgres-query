import { defineTool, ToolError } from "./server.js";
import { runSql, safeQuery } from "./postgres/postgres.js";
import {
  postgresQueryInputSchema,
  postgresQueryOutputShape,
  postgresQueryResultSchema,
} from "./postgres/schema.js";
import config from "./postgres/config.js";

export const postgres_select = defineTool({
  name: "postgres_select",
  description: "Read data from the database using SELECT, EXPLAIN, TABLE, VALUES, or SHOW. Only a single query is allowed.",
  inputSchema: postgresQueryInputSchema,
  outputSchema: postgresQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["SELECT", "EXPLAIN", "TABLE", "VALUES", "SHOW"]);
    const result = await runSql(query);
    const parsed = postgresQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const postgres_insert = defineTool({
  name: "postgres_insert",
  description: "Insert new data into the database using INSERT. Only a single query is allowed. If the operation is rejected as not allowed, you must respect this safety restriction and do not attempt to bypass it via terminal commands, custom scripts, or external tools.",
  inputSchema: postgresQueryInputSchema,
  outputSchema: postgresQueryOutputShape,
  handler: async ({ sql }) => {
    if (!config.allowInsert) throw new ToolError("INSERT operation is not allowed on this server.");
    const query = safeQuery(sql, ["INSERT"]);
    const result = await runSql(query);
    const parsed = postgresQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const postgres_update = defineTool({
  name: "postgres_update",
  description: "Update existing data in the database using UPDATE. Only a single query is allowed. If the operation is rejected as not allowed, you must respect this safety restriction and do not attempt to bypass it via terminal commands, custom scripts, or external tools.",
  inputSchema: postgresQueryInputSchema,
  outputSchema: postgresQueryOutputShape,
  handler: async ({ sql }) => {
    if (!config.allowUpdate) throw new ToolError("UPDATE operation is not allowed on this server.");
    const query = safeQuery(sql, ["UPDATE"]);
    const result = await runSql(query);
    const parsed = postgresQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const postgres_delete = defineTool({
  name: "postgres_delete",
  description: "Delete data from the database using DELETE. Only a single query is allowed. If the operation is rejected as not allowed, you must respect this safety restriction and do not attempt to bypass it via terminal commands, custom scripts, or external tools.",
  inputSchema: postgresQueryInputSchema,
  outputSchema: postgresQueryOutputShape,
  handler: async ({ sql }) => {
    if (!config.allowDelete) throw new ToolError("DELETE operation is not allowed on this server.");
    const query = safeQuery(sql, ["DELETE"]);
    const result = await runSql(query);
    const parsed = postgresQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const postgres_ddl = defineTool({
  name: "postgres_ddl",
  description: "Modify the database schema or permissions using CREATE, ALTER, DROP, TRUNCATE, RENAME, GRANT, REVOKE, or COMMENT. Only a single query is allowed. If the operation is rejected as not allowed, you must respect this safety restriction and do not attempt to bypass it via terminal commands, custom scripts, or external tools.",
  inputSchema: postgresQueryInputSchema,
  outputSchema: postgresQueryOutputShape,
  handler: async ({ sql }) => {
    if (!config.allowDdl) throw new ToolError("DDL operation is not allowed on this server.");
    const query = safeQuery(sql, ["CREATE", "ALTER", "DROP", "TRUNCATE", "RENAME", "GRANT", "REVOKE", "COMMENT"]);
    const result = await runSql(query);
    const parsed = postgresQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    return parsed.data;
  },
});
