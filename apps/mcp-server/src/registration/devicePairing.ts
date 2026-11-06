import { randomBytes, randomUUID } from "node:crypto";
import type { DevicePairingClaim, DevicePairingStart } from "../../../../shared/index.ts";
import { verifyDeviceKey } from "./bridgeTickets.ts";
import { replaceBrowserRegistration } from "./pairing.ts";
import { createSecret, isSecret, runStateTransaction, secretDigest } from "./stateDatabase.ts";
import type { StateDatabase } from "./stateDatabase.ts";

export function startDevicePairing(database: StateDatabase, deviceKey = "", now = Date.now()): DevicePairingStart | null {
  const value = randomBytes(6).toString("hex").toUpperCase();
  const approvalCode = `${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8)}`;
  const requestKey = createSecret();
  const expiresAt = now + 300_000;
  const previous = verifyDeviceKey(database, deviceKey);
  database.prepare("DELETE FROM channel_pairing WHERE expires_at <= ?").run(now);
  const result = database.prepare(`
    INSERT INTO channel_pairing(request_digest, code_digest, expires_at, replaces_binding_id)
    SELECT ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM channel_pairing) < 128
  `).run(secretDigest(requestKey), secretDigest(approvalCode), expiresAt, previous?.bindingId ?? null);
  return result.changes ? { approvalCode, requestKey, expiresAt } : null;
}

export function approveDevicePairing(database: StateDatabase, code: string, now = Date.now()): string | null {
  if (!/^[0-9A-F]{4}(?:-[0-9A-F]{4}){2}$/.test(code)) return null;
  const connectionKey = createSecret();
  const approved = database.prepare(`
    UPDATE channel_pairing SET connection_digest = ?
    WHERE code_digest = ? AND expires_at > ? AND connection_digest IS NULL
  `).run(secretDigest(connectionKey), secretDigest(code), now);
  return approved.changes ? connectionKey : null;
}

export function claimDevicePairing(database: StateDatabase, requestKey: string, now = Date.now()): DevicePairingClaim {
  if (!isSecret(requestKey)) return { status: "unavailable" };
  const digest = secretDigest(requestKey);
  return runStateTransaction(database, () => {
    const request = database.prepare(
      "SELECT connection_digest, replaces_binding_id FROM channel_pairing WHERE request_digest = ? AND expires_at > ?",
    ).get(digest, now);
    if (!request) return { status: "unavailable" };
    if (typeof request.connection_digest !== "string") return { status: "pending" };

    database.prepare("DELETE FROM channel_pairing WHERE request_digest = ?").run(digest);
    const previous = request.replaces_binding_id;
    const ownerId = typeof previous === "string" ? database.prepare("SELECT owner_id FROM bindings WHERE binding_id = ?")
      .get(previous)?.owner_id : randomUUID();
    if (typeof ownerId !== "string") return { status: "unavailable" };
    const registration = replaceBrowserRegistration(database, ownerId);
    database.prepare("INSERT INTO channel_connections(digest, binding_id) VALUES (?, ?)")
      .run(request.connection_digest, registration.bindingId);
    return { status: "registered", registration };
  });
}
