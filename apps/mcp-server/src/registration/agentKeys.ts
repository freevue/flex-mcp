import { randomUUID } from "node:crypto";
import type { StateDatabase } from "./stateDatabase.ts";
import type { VerifiedCallerIdentity } from "../access/types.ts";
import { createSecret, isSecret, requireOwnerId, runStateTransaction, secretDigest } from "./stateDatabase.ts";

export function issueAgentKey(database: StateDatabase, ownerId: string, canApprove = false): { callerId: string; key: string } {
  requireOwnerId(ownerId);
  const callerId = randomUUID();
  const key = createSecret();
  return runStateTransaction(database, () => {
    database.prepare("INSERT INTO agents(caller_id, owner_id, digest) VALUES (?, ?, ?)").run(callerId, ownerId, secretDigest(key));
    if (canApprove) database.prepare("INSERT INTO approval_agents(caller_id) VALUES (?)").run(callerId);
    return { callerId, key };
  });
}

export function verifyAgentKey(database: StateDatabase, key: string): VerifiedCallerIdentity | null {
  if (!isSecret(key)) return null;
  const row = database.prepare("SELECT caller_id AS callerId, owner_id AS ownerId FROM agents WHERE digest = ?").get(secretDigest(key));
  return row && typeof row.callerId === "string" && typeof row.ownerId === "string"
    ? { callerId: row.callerId, ownerId: row.ownerId } : null;
}
