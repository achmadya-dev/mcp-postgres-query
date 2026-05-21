import type { QueryResult } from "pg";
import type { PostgresConfig } from "../types.js";
import { createClient } from "./connection.js";

export interface ResultSetPayload {
  kind: "resultset";
  command: string;
  columns: string[];
  rowCount: number;
  totalRows: number;
  truncated: boolean;
  maxRows: number;
  rows: Record<string, unknown>[];
}

export interface ExecutePayload {
  kind: "execute";
  command: string;
  affectedRows: number;
}

export type QueryPayload = ResultSetPayload | ExecutePayload;

function buildResultSetPayload(
  result: QueryResult,
  maxRows: number
): ResultSetPayload {
  const columns = result.fields.map((f) => f.name);
  const data = result.rows as Record<string, unknown>[];
  const truncated = data.length > maxRows;
  const display = data.slice(0, maxRows);
  return {
    kind: "resultset",
    command: result.command,
    columns,
    rowCount: display.length,
    totalRows: data.length,
    truncated,
    maxRows,
    rows: display,
  };
}

function buildExecutePayload(result: QueryResult): ExecutePayload {
  return {
    kind: "execute",
    command: result.command,
    affectedRows: result.rowCount ?? 0,
  };
}

export async function runSql(
  config: PostgresConfig,
  sql: string
): Promise<QueryPayload> {
  const client = await createClient(config);
  try {
    const result = await client.query(sql);
    if (result.fields && result.fields.length > 0) {
      return buildResultSetPayload(result, config.maxRows);
    }
    return buildExecutePayload(result);
  } finally {
    await client.end();
  }
}
