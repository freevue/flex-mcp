import { randomBytes } from "node:crypto";
import type { StateDatabase } from "./stateDatabase.ts";
import type { DevicePairingClaim, DevicePairingStart } from "../../../../shared/index.ts";
import type { VerifiedCallerIdentity } from "../access/index.ts";
import { createSecret, isSecret, runStateTransaction, secretDigest } from "./stateDatabase.ts";
import { replaceBrowserRegistration } from "./pairing.ts";

export function startDevicePairing(database: StateDatabase, now = Date.now()): DevicePairingStart | null {
  const value = randomBytes(6).toString("hex").toUpperCase();
  const approvalCode = `${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8)}`;
  const requestKey = createSecret();
  const expiresAt = now + 300_000;
  database.prepare("DELETE FROM device_pairing WHERE expires_at <= ?").run(now);
  const result = database.prepare(`
    INSERT INTO device_pairing(request_digest, code_digest, expires_at)
    SELECT ?, ?, ? WHERE (SELECT COUNT(*) FROM device_pairing) < 128
  `).run(secretDigest(requestKey), secretDigest(approvalCode), expiresAt);
  return result.changes ? { approvalCode, requestKey, expiresAt } : null;
}

export function approveDevicePairing(database: StateDatabase, identity: VerifiedCallerIdentity, code: string, now = Date.now()): boolean {
  if (!/^[0-9A-F]{4}(?:-[0-9A-F]{4}){2}$/.test(code)) return false;
  const digest = secretDigest(code);
  return runStateTransaction(database, () => {
    const approved = database.prepare(`
      UPDATE device_pairing SET caller_id = ?, owner_id = ?
      WHERE code_digest = ? AND expires_at > ? AND caller_id IS NULL
      AND EXISTS (
        SELECT 1 FROM agents JOIN approval_agents USING(caller_id)
        WHERE caller_id = ? AND owner_id = ?
      )
    `).run(identity.callerId, identity.ownerId, digest, now, identity.callerId, identity.ownerId);
    if (approved.changes) {
      database.prepare("DELETE FROM device_pairing WHERE owner_id = ? AND code_digest <> ?")
        .run(identity.ownerId, digest);
    }
    return Boolean(approved.changes);
  });
}

export function claimDevicePairing(database: StateDatabase, requestKey: string, now = Date.now()): DevicePairingClaim {
  if (!isSecret(requestKey)) return { status: "unavailable" };
  const digest = secretDigest(requestKey);
  return runStateTransaction(database, () => {
    const request = database.prepare("SELECT caller_id, owner_id FROM device_pairing WHERE request_digest = ? AND expires_at > ?")
      .get(digest, now);
    if (!request || typeof request.owner_id !== "string" || typeof request.caller_id !== "string") {
      return { status: request ? "pending" : "unavailable" };
    }
    const permission = database.prepare(`
      SELECT 1 FROM agents JOIN approval_agents USING(caller_id) WHERE caller_id = ? AND owner_id = ?
    `).get(request.caller_id, request.owner_id);
    database.prepare("DELETE FROM device_pairing WHERE request_digest = ?").run(digest);
    const registration = permission ? replaceBrowserRegistration(database, request.owner_id) : null;
    return registration ? { status: "registered", registration } : { status: "unavailable" };
  });
}
