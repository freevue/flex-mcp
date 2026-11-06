import { statSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { initializeStateDatabase } from "./stateDatabase.ts";

export * from "./stateDatabase.ts";

export function openStateDatabase(file: string): DatabaseSync {
  if (file !== ":memory:") {
    process.umask(0o077);
    const existing = statSync(file, { throwIfNoEntry: false });
    if (existing && (!existing.isFile() || (existing.mode & 0o077) !== 0)) {
      throw new Error("상태 파일을 소유자만 읽고 쓸 수 있도록 설정하세요.");
    }
  }
  const database = new DatabaseSync(file);
  database.exec("PRAGMA busy_timeout = 3000; PRAGMA foreign_keys = ON;");
  initializeStateDatabase(database);
  return database;
}
