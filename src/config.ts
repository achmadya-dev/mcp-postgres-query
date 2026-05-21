import type { PostgresConfig } from "./types.js";

function envBool(name: string, defaultVal = false): boolean {
  const v = process.env[name];
  if (v === undefined) return defaultVal;
  return ["1", "true", "yes", "on"].includes(v.trim().toLowerCase());
}

function envInt(name: string, defaultVal: number, min = 1): number {
  const raw = process.env[name];
  if (raw === undefined) return defaultVal;
  const parsed = parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < min) return defaultVal;
  return parsed;
}

function envStr(name: string, defaultVal: string): string {
  return process.env[name] ?? defaultVal;
}

function envOptionalStr(name: string): string | undefined {
  const v = process.env[name]?.trim();
  return v && v.length > 0 ? v : undefined;
}

let cached: PostgresConfig | null = null;

/** Env ALLOW_* untuk tulis/DDL default `false` — hanya read (SELECT, EXPLAIN, …) kecuali diaktifkan eksplisit. */
export function loadConfig(): PostgresConfig {
  if (cached) return cached;
  cached = {
    host: envStr("POSTGRES_HOST", "127.0.0.1"),
    port: envInt("POSTGRES_PORT", 5432),
    user: envStr("POSTGRES_USER", "postgres"),
    password: envStr("POSTGRES_PASSWORD", ""),
    database: envOptionalStr("POSTGRES_DATABASE"),
    maxRows: envInt("POSTGRES_MAX_ROWS", 500),
    allowInsert: envBool("ALLOW_INSERT_OPERATION", false),
    allowUpdate: envBool("ALLOW_UPDATE_OPERATION", false),
    allowDelete: envBool("ALLOW_DELETE_OPERATION", false),
    allowDdl: envBool("ALLOW_DDL_OPERATION", false),
  };
  return cached;
}
