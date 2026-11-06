import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type { VerifiedCallerIdentity } from "../access/types.ts";
import { createSecret, isSecret, requireOwnerId, secretDigest } from "./database.ts";

export function issueAgentKey(database: DatabaseSync, ownerId: string): { callerId: string; key: string } {
  requireOwnerId(ownerId);
  const callerId = randomUUID();
  const key = createSecret();
  database.prepare("INSERT INTO agents(caller_id, owner_id, digest) VALUES (?, ?, ?)").run(callerId, ownerId, secretDigest(key));
  return { callerId, key };
}

export function verifyAgentKey(database: DatabaseSync, key: string): VerifiedCallerIdentity | null {
  if (!isSecret(key)) return null;
  const row = database.prepare("SELECT caller_id AS callerId, owner_id AS ownerId FROM agents WHERE digest = ?").get(secretDigest(key));
  return row && typeof row.callerId === "string" && typeof row.ownerId === "string"
    ? { callerId: row.callerId, ownerId: row.ownerId } : null;
}
