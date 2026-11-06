import { createHash, randomBytes } from "node:crypto";
import { statSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import type { BrowserBinding } from "../access/types.ts";

export function openStateDatabase(file: string): DatabaseSync {
  if (file !== ":memory:") {
    process.umask(0o077);
    const existing = statSync(file, { throwIfNoEntry: false });
    if (existing && (!existing.isFile() || (existing.mode & 0o077) !== 0)) {
      throw new Error("상태 파일을 소유자만 읽고 쓸 수 있도록 설정하세요.");
    }
  }
  const database = new DatabaseSync(file);
  database.exec(`
    PRAGMA busy_timeout = 3000;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS agents (
      caller_id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, digest TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS pair_codes (
      digest TEXT PRIMARY KEY, owner_id TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS bindings (
      binding_id TEXT PRIMARY KEY, owner_id TEXT NOT NULL UNIQUE, digest TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS tickets (
      digest TEXT PRIMARY KEY, binding_id TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL,
      FOREIGN KEY (binding_id) REFERENCES bindings(binding_id) ON DELETE CASCADE
    );
  `);
  return database;
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
