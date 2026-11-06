import { randomBytes, randomUUID } from "node:crypto";
import { failure, success } from "../../../../shared/index.ts";
import type { DevicePairingClaim, DevicePairingStart, Outcome } from "../../../../shared/index.ts";
import { verifyDeviceKey } from "./bridgeTickets.ts";
import { replaceBrowserRegistration } from "./pairing.ts";
import { createSecret, isSecret, runStateTransaction, secretDigest } from "./stateDatabase.ts";
import type { StateDatabase } from "./stateDatabase.ts";

function issuePairingRequest(database: StateDatabase, bindingId: string | null, now: number, invite: boolean): DevicePairingStart | null {
  const value = randomBytes(6).toString("hex").toUpperCase();
  const approvalCode = `${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8)}`;
  const requestKey = createSecret();
  const expiresAt = now + 300_000;
  database.prepare("DELETE FROM channel_pairing WHERE expires_at <= ?").run(now);
  database.prepare("DELETE FROM channel_invites WHERE expires_at <= ?").run(now);
  const table = invite ? "channel_invites" : "channel_pairing";
  const bindingColumn = invite ? "binding_id" : "replaces_binding_id";
  const result = database.prepare(`
    INSERT INTO ${table}(request_digest, code_digest, expires_at, ${bindingColumn})
    SELECT ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM channel_pairing) + (SELECT COUNT(*) FROM channel_invites) < 128
    AND NOT EXISTS (SELECT 1 FROM ${invite ? "channel_pairing" : "channel_invites"} WHERE code_digest = ?)
    ON CONFLICT DO NOTHING
  `).run(secretDigest(requestKey), secretDigest(approvalCode), expiresAt, bindingId, secretDigest(approvalCode));
  return result.changes ? { approvalCode, requestKey, expiresAt } : null;
}

export function startDevicePairing(database: StateDatabase, deviceKey = "", now = Date.now()): DevicePairingStart | null {
  return issuePairingRequest(database, verifyDeviceKey(database, deviceKey)?.bindingId ?? null, now, false);
}

export function startChannelInvitation(database: StateDatabase, deviceKey: string, now = Date.now()):
  Outcome<DevicePairingStart, "INVALID_DEVICE_KEY" | "PAIRING_LIMIT"> {
  const binding = verifyDeviceKey(database, deviceKey, true);
  if (!binding) return failure("INVALID_DEVICE_KEY");
  const started = issuePairingRequest(database, binding.bindingId, now, true);
  return started ? success(started) : failure("PAIRING_LIMIT");
}

export function approveDevicePairing(database: StateDatabase, code: string, now = Date.now()): string | null {
  if (!/^[0-9A-F]{4}(?:-[0-9A-F]{4}){2}$/.test(code)) return null;
  const connectionKey = createSecret();
  const connectionDigest = secretDigest(connectionKey);
  const codeDigest = secretDigest(code);
  return runStateTransaction(database, () => {
    const approved = database.prepare(`
      UPDATE channel_pairing SET connection_digest = ?
      WHERE code_digest = ? AND expires_at > ? AND connection_digest IS NULL
    `).run(connectionDigest, codeDigest, now);
    if (approved.changes) return connectionKey;
    const invitation = database.prepare(`
      UPDATE channel_invites SET approved = 1
      WHERE code_digest = ? AND expires_at > ? AND approved = 0 RETURNING binding_id
    `).get(codeDigest, now);
    if (typeof invitation?.binding_id !== "string") return null;
    database.prepare("INSERT INTO channel_additional_connections(digest, binding_id) VALUES (?, ?)")
      .run(connectionDigest, invitation.binding_id);
    return connectionKey;
  });
}

export function claimDevicePairing(database: StateDatabase, requestKey: string, now = Date.now()): DevicePairingClaim {
  if (!isSecret(requestKey)) return { status: "unavailable" };
  const digest = secretDigest(requestKey);
  return runStateTransaction(database, () => {
    const request = database.prepare(
      "SELECT connection_digest, replaces_binding_id FROM channel_pairing WHERE request_digest = ? AND expires_at > ?",
    ).get(digest, now);
    if (!request) {
      const invitation = database.prepare("SELECT approved FROM channel_invites WHERE request_digest = ? AND expires_at > ?")
        .get(digest, now);
      if (!invitation) return { status: "unavailable" };
      if (invitation.approved !== 1) return { status: "pending" };
      database.prepare("DELETE FROM channel_invites WHERE request_digest = ?").run(digest);
      return { status: "linked" };
    }
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
