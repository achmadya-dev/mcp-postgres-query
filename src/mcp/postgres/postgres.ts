import pg from "pg";
import { ToolError } from "../server.js";
import config from "./config.js";

export function safeQuery(sql: string, allowedPrefixes: string[]): string {
  const clean = sql.trim();
  if (!clean) throw new ToolError("SQL query cannot be empty.");

  const upper = clean.toUpperCase();
  const hasPrefix = allowedPrefixes.some(prefix => {
    if (!upper.startsWith(prefix)) return false;
    if (upper.length === prefix.length) return true;
    const nextChar = upper.charAt(prefix.length);
    return /\s/.test(nextChar);
  });
  if (!hasPrefix) throw new ToolError(`SQL query is not allowed for this tool. It must start with one of: ${allowedPrefixes.join(", ")}`);

  const parts: string[] = [];
  let current = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;
  let escape = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean.charAt(i);
    if (escape) {
      current += char;
      escape = false;
      continue;
    }

    if (char === "\\") {
      current += char;
      escape = true;
      continue;
    }

    if (char === "'" && !inDoubleQuote && !inBacktick) inSingleQuote = !inSingleQuote;
    if (char === '"' && !inSingleQuote && !inBacktick) inDoubleQuote = !inDoubleQuote;
    if (char === "`" && !inSingleQuote && !inDoubleQuote) inBacktick = !inBacktick;

    if (char === ";" && !inSingleQuote && !inDoubleQuote && !inBacktick) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (current.length > 0) parts.push(current);

  const nonEmptyParts = parts.map(p => p.trim()).filter(p => p.length > 0);
  if (nonEmptyParts.length > 1) throw new ToolError("Only a single SQL query is allowed per call (multiple queries separated by ';' are not allowed).");

  return clean;
}

export async function runSql(sql: string): Promise<{
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
}> {
  const client = new pg.Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
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
    throw new ToolError(
      `PostgreSQL: ${e instanceof Error ? e.message : String(e)}`
    );
  } finally {
    await client.end();
  }
}
