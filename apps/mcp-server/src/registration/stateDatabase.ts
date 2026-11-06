import { createHash, randomBytes } from "node:crypto";
import type { BrowserBinding } from "../access/types.ts";

type StateParameter = string | number | null;
type StateStatement = {
  get(...parameters: StateParameter[]): Record<string, unknown> | undefined;
  run(...parameters: StateParameter[]): { changes: number | bigint };
};

export type StateDatabase = {
  exec(sql: string): void;
  prepare(sql: string): StateStatement;
  transactionSync?<Result>(operation: () => Result): Result;
};

export function initializeStateDatabase(database: StateDatabase): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      caller_id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, digest TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS approval_agents (
      caller_id TEXT PRIMARY KEY REFERENCES agents(caller_id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS device_pairing (
      request_digest TEXT PRIMARY KEY, code_digest TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL,
      caller_id TEXT, owner_id TEXT
    );
    CREATE TABLE IF NOT EXISTS pair_codes (
      digest TEXT PRIMARY KEY, owner_id TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS bindings (
      binding_id TEXT PRIMARY KEY, owner_id TEXT NOT NULL UNIQUE, digest TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS channel_pairing (
      request_digest TEXT PRIMARY KEY, code_digest TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL,
      connection_digest TEXT, replaces_binding_id TEXT
    );
    CREATE TABLE IF NOT EXISTS channel_connections (
      digest TEXT PRIMARY KEY, binding_id TEXT NOT NULL UNIQUE REFERENCES bindings(binding_id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS tickets (
      digest TEXT PRIMARY KEY, binding_id TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL,
      FOREIGN KEY (binding_id) REFERENCES bindings(binding_id) ON DELETE CASCADE
    );
  `);
}

export function runStateTransaction<Result>(database: StateDatabase, operation: () => Result): Result {
  if (database.transactionSync) return database.transactionSync(operation);
  database.exec("BEGIN IMMEDIATE");
  try {
    const result = operation();
    database.exec("COMMIT");
    return result;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function createSecret(): string {
  return randomBytes(32).toString("base64url");
}

export function secretDigest(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export function isSecret(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);
}

export function requireOwnerId(ownerId: string): void {
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(ownerId)) throw new Error("사용자 ID는 영문, 숫자, 밑줄, 하이픈으로 입력하세요.");
}

export function asBrowserBinding(row: Record<string, unknown> | undefined): BrowserBinding | null {
  return row && typeof row.ownerId === "string" && typeof row.bindingId === "string"
    ? { ownerId: row.ownerId, bindingId: row.bindingId } : null;
}
