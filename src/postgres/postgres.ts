import pg from "pg";
import { ToolError } from "@achmadya-dev/mcp-core";
import config from "./config.js";
import { formatConnectionError } from "../connection-status.js";
import * as helpers from "./helpers.js";

export function safeQuery(sql: string, allowedPrefixes: string[]): string {
  const { cleanSql, prefixes } = helpers.validateInputs(sql, allowedPrefixes);
  const statement = helpers.parseSingleStatement(cleanSql);
  helpers.validateStatement(statement, prefixes);
  return statement;
}

export async function checkConnection(): Promise<void> {
  const client = new pg.Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
  });

  try {
    await client.connect();
    await client.query("SELECT 1");
  } catch (e) {
    throw new Error(formatConnectionError("PostgreSQL", e));
  } finally {
    await client.end();
  }
}

export async function runSql(
  sql: string,
  options?: { database?: string }
): Promise<
  | {
      kind: "resultset";
      columns: string[];
      rowCount: number;
      totalRows: number;
      truncated: boolean;
      maxRows: number;
      rows: Record<string, any>[];
    }
  | {
      kind: "execute";
      affectedRows: number;
    }
> {
  const database = helpers.resolveDatabase(config.database, options?.database);

  const client = new pg.Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database,
  });

  try {
    await client.connect();
    const result = await client.query(sql);

    // If result has fields, it's a SELECT/result set query
    if (result.fields && result.fields.length > 0) {
      const columns = result.fields.map((f) => f.name);
      const all = result.rows as Record<string, any>[];
      const truncated = all.length > config.maxRows;
      const display = all.slice(0, config.maxRows);

      return {
        kind: "resultset",
        columns,
        rowCount: display.length,
        totalRows: all.length,
        truncated,
        maxRows: config.maxRows,
        rows: display,
      };
    }

    // Otherwise, it's a DML/DDL execution query
    return {
      kind: "execute",
      affectedRows: result.rowCount ?? 0,
    };
  } catch (e) {
    throw new ToolError(`PostgreSQL: ${e instanceof Error ? e.message : String(e)}`);
  } finally {
    await client.end();
  }
}
