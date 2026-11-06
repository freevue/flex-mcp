import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type { BridgeRegistration } from "../../../../shared/index.ts";
import { createSecret, isSecret, requireOwnerId, secretDigest } from "./database.ts";

export function issuePairingCode(database: DatabaseSync, ownerId: string, now = Date.now()): string {
  requireOwnerId(ownerId);
  const code = createSecret();
  database.prepare(`
    INSERT INTO pair_codes(digest, owner_id, expires_at) VALUES (?, ?, ?)
    ON CONFLICT(owner_id) DO UPDATE SET digest = excluded.digest, expires_at = excluded.expires_at
  `).run(secretDigest(code), ownerId, now + 600_000);
  return code;
}

export function redeemPairingCode(database: DatabaseSync, code: string, now = Date.now()): BridgeRegistration | null {
  if (!isSecret(code)) return null;
  database.exec("BEGIN IMMEDIATE");
  try {
    const ownerId = database.prepare(
      "DELETE FROM pair_codes WHERE digest = ? AND expires_at > ? RETURNING owner_id",
    ).get(secretDigest(code), now)?.owner_id;
    if (typeof ownerId !== "string") {
      database.exec("COMMIT");
      return null;
    }
    const bindingId = randomUUID();
    const deviceKey = createSecret();
    database.prepare("DELETE FROM bindings WHERE owner_id = ?").run(ownerId);
    database.prepare("INSERT INTO bindings(binding_id, owner_id, digest) VALUES (?, ?, ?)").run(bindingId, ownerId, secretDigest(deviceKey));
    database.exec("COMMIT");
    return { bindingId, deviceKey };
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}
