import { randomUUID } from "node:crypto";
import type { StateDatabase } from "./stateDatabase.ts";
import type { BridgeRegistration } from "../../../../shared/index.ts";
import { createSecret, isSecret, requireOwnerId, runStateTransaction, secretDigest } from "./stateDatabase.ts";

export function issuePairingCode(database: StateDatabase, ownerId: string, now = Date.now()): string {
  requireOwnerId(ownerId);
  const code = createSecret();
  database.prepare(`
    INSERT INTO pair_codes(digest, owner_id, expires_at) VALUES (?, ?, ?)
    ON CONFLICT(owner_id) DO UPDATE SET digest = excluded.digest, expires_at = excluded.expires_at
  `).run(secretDigest(code), ownerId, now + 600_000);
  return code;
}

// 호출자가 등록 변경과 요청 소비를 같은 트랜잭션에 넣습니다.
export function replaceBrowserRegistration(database: StateDatabase, ownerId: string): BridgeRegistration {
  const bindingId = randomUUID();
  const deviceKey = createSecret();
  database.prepare("DELETE FROM bindings WHERE owner_id = ?").run(ownerId);
  database.prepare("INSERT INTO bindings(binding_id, owner_id, digest) VALUES (?, ?, ?)").run(bindingId, ownerId, secretDigest(deviceKey));
  return { bindingId, deviceKey };
}

export function redeemPairingCode(database: StateDatabase, code: string, now = Date.now()): BridgeRegistration | null {
  if (!isSecret(code)) return null;
  return runStateTransaction(database, () => {
    const ownerId = database.prepare(
      "DELETE FROM pair_codes WHERE digest = ? AND expires_at > ? RETURNING owner_id",
    ).get(secretDigest(code), now)?.owner_id;
    return typeof ownerId === "string" ? replaceBrowserRegistration(database, ownerId) : null;
  });
}
