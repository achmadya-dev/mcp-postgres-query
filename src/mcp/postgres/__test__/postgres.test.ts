import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { ClientConfig } from "pg";

describe("resolveDatabase", () => {
  let resolveDatabase: typeof import("../helpers.js").resolveDatabase;

  beforeEach(async () => {
    ({ resolveDatabase } = await import("../helpers.js"));
  });

  it("locks to POSTGRES_DATABASE when it is configured", () => {
    expect(resolveDatabase("riset", undefined)).toBe("riset");
    expect(resolveDatabase("riset", "riset")).toBe("riset");
  });

  it("rejects a different database when POSTGRES_DATABASE is configured", () => {
    expect(() => resolveDatabase("riset", "postgres")).toThrow(
      /locked to POSTGRES_DATABASE="riset"/
    );
  });

  it("requires database parameter when POSTGRES_DATABASE is not configured", () => {
    expect(() => resolveDatabase(undefined, undefined)).toThrow(
      /No database specified/
    );
    expect(resolveDatabase(undefined, "postgres")).toBe("postgres");
  });
});

describe("validateDatabaseName", () => {
  let validateDatabaseName: typeof import("../helpers.js").validateDatabaseName;

  beforeEach(async () => {
    ({ validateDatabaseName } = await import("../helpers.js"));
  });

  it("accepts valid database names", () => {
    expect(validateDatabaseName("riset")).toBe("riset");
    expect(validateDatabaseName("  my_db2  ")).toBe("my_db2");
  });

  it("rejects empty or invalid database names", () => {
    expect(() => validateDatabaseName("  ")).toThrow(/cannot be empty/);
    expect(() => validateDatabaseName("9starts_with_digit")).toThrow(/Invalid database name/);
    expect(() => validateDatabaseName("has-dash")).toThrow(/Invalid database name/);
  });
});

describe("safeQuery", () => {
  let safeQuery: typeof import("../postgres.js").safeQuery;

  beforeEach(async () => {
    ({ safeQuery } = await import("../postgres.js"));
  });

  it("allows queries with matching prefixes", () => {
    const res = safeQuery("SELECT id FROM users", ["SELECT", "EXPLAIN"]);
    expect(res).toBe("SELECT id FROM users");
  });

  it("rejects queries with non-matching prefixes", () => {
    expect(() => safeQuery("INSERT INTO users", ["SELECT"])).toThrow(
      /SQL query is not allowed/
    );
  });

  it("allows a trailing semicolon on a single query", () => {
    const res = safeQuery("SELECT 1;", ["SELECT"]);
    expect(res).toBe("SELECT 1");
  });

  it("allows semicolons inside string literals", () => {
    const res = safeQuery("SELECT * FROM users WHERE email = 'a;b';", ["SELECT"]);
    expect(res).toBe("SELECT * FROM users WHERE email = 'a;b'");
  });

  it("rejects multiple queries separated by semicolons", () => {
    expect(() => safeQuery("SELECT 1; SELECT 2", ["SELECT"])).toThrow(
      /Only a single SQL query is allowed/
    );
  });

  it("throws an error if the query is empty", () => {
    expect(() => safeQuery("  ", ["SELECT"])).toThrow(/SQL query cannot be empty/);
  });

  it("allows a single-line comment at the start of the query", () => {
    const res = safeQuery("-- komentar ini\nSELECT 1", ["SELECT"]);
    expect(res).toBe("-- komentar ini\nSELECT 1");
  });

  it("allows a block comment at the start of the query", () => {
    const res = safeQuery("/* komentar blok */ SELECT 1", ["SELECT"]);
    expect(res).toBe("/* komentar blok */ SELECT 1");
  });

  it("allows double single quotes inside string literals", () => {
    const res = safeQuery("SELECT 'it''s fine'", ["SELECT"]);
    expect(res).toBe("SELECT 'it''s fine'");
  });

  it("allows backslash escape inside string literals", () => {
    const res = safeQuery("SELECT 'Achmad\\'s book'", ["SELECT"]);
    expect(res).toBe("SELECT 'Achmad\\'s book'");
  });

  it("allows MSSQL bracket identifiers", () => {
    const res = safeQuery("SELECT [column;name] FROM users", ["SELECT"]);
    expect(res).toBe("SELECT [column;name] FROM users");
  });

  it("rejects queries with unterminated single quotes", () => {
    expect(() => safeQuery("SELECT 'hello", ["SELECT"])).toThrow(
      /Unterminated single quote string/
    );
  });

  it("rejects queries with unterminated block comments", () => {
    expect(() => safeQuery("/* komentar SELECT 1", ["SELECT"])).toThrow(
      /Unterminated block comment/
    );
  });

  it("rejects dangerous SQL patterns like XP_CMDSHELL or LOAD_FILE", () => {
    expect(() => safeQuery("SELECT LOAD_FILE('/etc/passwd')", ["SELECT"])).toThrow(
      /Dangerous SQL pattern detected/
    );
    expect(() => safeQuery("EXEC xp_cmdshell 'dir'", ["EXEC", "SELECT"])).toThrow(
      /Dangerous SQL pattern detected/
    );
  });
});

describe("runSql", () => {
  const mockConnect = jest.fn<() => Promise<void>>();
  const mockQuery = jest.fn<() => Promise<unknown>>();
  const mockEnd = jest.fn<() => Promise<void>>();
  const mockClient = jest.fn((_config: ClientConfig) => ({
    connect: mockConnect,
    query: mockQuery,
    end: mockEnd,
  }));

  beforeEach(async () => {
    jest.resetModules();
    mockConnect.mockReset();
    mockQuery.mockReset();
    mockEnd.mockReset();
    mockClient.mockReset();

    mockConnect.mockResolvedValue(undefined);
    mockEnd.mockResolvedValue(undefined);
    mockClient.mockImplementation((_config: ClientConfig) => ({
      connect: mockConnect,
      query: mockQuery,
      end: mockEnd,
    }));

    await jest.unstable_mockModule("pg", () => ({
      default: { Client: mockClient },
    }));

    await jest.unstable_mockModule("../config.js", () => ({
      default: {
        host: "127.0.0.1",
        port: 5432,
        user: "",
        password: "",
        database: "riset",
        maxRows: 2,
        allowInsert: false,
        allowUpdate: false,
        allowDelete: false,
        allowDdl: false,
      },
    }));
  });

  it("returns a result set and truncates rows according to maxRows", async () => {
    mockQuery.mockResolvedValue({
      fields: [{ name: "id" }],
      rows: [{ id: 1 }, { id: 2 }, { id: 3 }],
    });

    const { runSql } = await import("../postgres.js");
    const result = await runSql("SELECT id FROM users");

    expect(result).toEqual({
      kind: "resultset",
      columns: ["id"],
      rowCount: 2,
      totalRows: 3,
      truncated: true,
      maxRows: 2,
      rows: [{ id: 1 }, { id: 2 }],
    });
    expect(mockEnd).toHaveBeenCalled();
  });

  it("returns an execute result for DML without a result set", async () => {
    mockQuery.mockResolvedValue({
      fields: [],
      rowCount: 1,
      rows: [],
    });

    const { runSql } = await import("../postgres.js");
    const result = await runSql("UPDATE users SET active = 1");

    expect(result).toEqual({
      kind: "execute",
      affectedRows: 1,
    });
  });

  it("throws a ToolError when connection fails", async () => {
    mockConnect.mockRejectedValue(new Error("ECONNREFUSED"));

    const { runSql } = await import("../postgres.js");
    await expect(runSql("SELECT 1")).rejects.toThrow(/PostgreSQL: ECONNREFUSED/);
  });

  it("uses the database parameter when POSTGRES_DATABASE is not configured", async () => {
    await jest.unstable_mockModule("../config.js", () => ({
      default: {
        host: "127.0.0.1",
        port: 5432,
        user: "",
        password: "",
        database: undefined,
        maxRows: 2,
        allowInsert: false,
        allowUpdate: false,
        allowDelete: false,
        allowDdl: false,
      },
    }));

    mockQuery.mockResolvedValue({
      fields: [{ name: "ok" }],
      rows: [{ ok: 1 }],
    });

    const { runSql } = await import("../postgres.js");
    await runSql("SELECT 1", { database: "other_db" });

    expect(mockClient).toHaveBeenCalledWith(
      expect.objectContaining({ database: "other_db" })
    );
  });

  it("rejects switching databases when POSTGRES_DATABASE is configured", async () => {
    await jest.unstable_mockModule("../config.js", () => ({
      default: {
        host: "127.0.0.1",
        port: 5432,
        user: "",
        password: "",
        database: "riset",
        maxRows: 2,
        allowInsert: false,
        allowUpdate: false,
        allowDelete: false,
        allowDdl: false,
      },
    }));

    const { runSql } = await import("../postgres.js");
    await expect(runSql("SELECT 1", { database: "postgres" })).rejects.toThrow(
      /locked to POSTGRES_DATABASE="riset"/
    );
  });
});
