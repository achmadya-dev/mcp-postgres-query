import { envBool, envInt, envStr } from "@achmadya-dev/mcp-core";

export default {
  host: envStr("POSTGRES_HOST", "localhost"),
  port: envInt("POSTGRES_PORT", 5432),
  user: envStr("POSTGRES_USER"),
  password: envStr("POSTGRES_PASSWORD", ""),
  database: envStr("POSTGRES_DATABASE") || undefined,
  maxRows: envInt("POSTGRES_MAX_ROWS", 500),
  allowInsert: envBool("ALLOW_INSERT_OPERATION"),
  allowUpdate: envBool("ALLOW_UPDATE_OPERATION"),
  allowDelete: envBool("ALLOW_DELETE_OPERATION"),
  allowDdl: envBool("ALLOW_DDL_OPERATION"),
};
