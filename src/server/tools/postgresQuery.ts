import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadConfig } from "../../config.js";
import { runSql } from "../../db/runner.js";
import {
  checkAllowed,
  checkBannedConstructs,
  firstKeyword,
  validateSingleStatement,
} from "../../policy/index.js";
import type { PostgresConfig } from "../../types.js";
import { errorResponse, jsonResponse } from "../../utils/response.js";

const TOOL_NAME = "postgres_query";
const TOOL_TITLE = "PostgreSQL query";
const TOOL_DESCRIPTION =
  "Run a single SQL statement on PostgreSQL (default: read-only). Connection from POSTGRES_* env vars; SELECT/EXPLAIN/TABLE/VALUES/SHOW are allowed; INSERT/UPDATE/DELETE/DDL are rejected unless the matching ALLOW_* env is set. CTE (WITH ...) and ROW_NUMBER() are always rejected. Results are returned as JSON.";

const inputSchema = {
  sql: z.string().describe("One SQL statement (no CTE / ROW_NUMBER)"),
};

async function handleQuery(config: PostgresConfig, sql: string) {
  const validation = validateSingleStatement(sql);
  if (!validation.ok) return errorResponse(validation.reason);

  const banned = checkBannedConstructs(sql);
  if (!banned.ok) return errorResponse(banned.reason);

  const keyword = firstKeyword(sql);
  if (!keyword) return errorResponse("Could not detect SQL command.");

  const permission = checkAllowed(keyword, {
    allowInsert: config.allowInsert,
    allowUpdate: config.allowUpdate,
    allowDelete: config.allowDelete,
    allowDdl: config.allowDdl,
  });
  if (!permission.ok) return errorResponse(permission.reason);

  try {
    const payload = await runSql(config, sql);
    return jsonResponse({ ok: true, ...payload });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return errorResponse(`PostgreSQL: ${msg}`);
  }
}

export function registerPostgresQueryTool(server: McpServer): void {
  const config = loadConfig();
  server.registerTool(
    TOOL_NAME,
    {
      title: TOOL_TITLE,
      description: TOOL_DESCRIPTION,
      inputSchema,
    },
    async ({ sql }) => handleQuery(config, sql)
  );
}
