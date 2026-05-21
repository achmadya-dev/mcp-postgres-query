import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPostgresQueryTool } from "./tools/postgresQuery.js";

export const SERVER_NAME = "PostgreSQL";
export const SERVER_VERSION = "0.1.0";

export function createServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });
  registerPostgresQueryTool(server);
  return server;
}
