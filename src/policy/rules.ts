import type { AllowFlags, PolicyResult } from "../types.js";
import { classifyStatement } from "./classify.js";
import { BANNED_PATTERNS } from "./keywords.js";
import { normalizeSql } from "./sanitize.js";

const ok = (): PolicyResult => ({ ok: true, reason: "" });
const deny = (reason: string): PolicyResult => ({ ok: false, reason });

export function checkAllowed(keyword: string, opts: AllowFlags): PolicyResult {
  const kind = classifyStatement(keyword);
  switch (kind) {
    case "read":
      return ok();
    case "insert":
      return opts.allowInsert
        ? ok()
        : deny("INSERT not allowed (set ALLOW_INSERT_OPERATION=true)");
    case "update":
      return opts.allowUpdate
        ? ok()
        : deny("UPDATE not allowed (set ALLOW_UPDATE_OPERATION=true)");
    case "delete":
      return opts.allowDelete
        ? ok()
        : deny("DELETE not allowed (set ALLOW_DELETE_OPERATION=true)");
    case "ddl":
      return opts.allowDdl
        ? ok()
        : deny("DDL not allowed (set ALLOW_DDL_OPERATION=true)");
    default:
      return deny(
        `Statement type '${keyword}' is not allowed by this MCP server.`
      );
  }
}

export function checkBannedConstructs(sql: string): PolicyResult {
  const normalized = normalizeSql(sql);
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.regex.test(normalized)) return deny(pattern.reason);
  }
  return ok();
}

export function validateSingleStatement(sql: string): PolicyResult {
  const stripped = sql.trim();
  if (!stripped) return deny("Empty query.");
  const safe = normalizeSql(stripped);
  const parts = safe
    .split(";")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  if (parts.length > 1) {
    return deny(
      "Only one SQL statement per call (no multiple statements separated by ';')."
    );
  }
  return ok();
}
