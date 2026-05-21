export interface PostgresConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string | undefined;
  maxRows: number;
  allowInsert: boolean;
  allowUpdate: boolean;
  allowDelete: boolean;
  allowDdl: boolean;
}

export type StatementKind =
  | "read"
  | "insert"
  | "update"
  | "delete"
  | "ddl"
  | "other";

export interface PolicyResult {
  ok: boolean;
  reason: string;
}

export interface AllowFlags {
  allowInsert: boolean;
  allowUpdate: boolean;
  allowDelete: boolean;
  allowDdl: boolean;
}
