import type { StateDatabase } from "./stateDatabase.ts";
import type { BrowserBinding } from "../access/types.ts";
import { asBrowserBinding, createSecret, isSecret, secretDigest } from "./stateDatabase.ts";

export function verifyDeviceKey(database: StateDatabase, key: string, channelOnly = false): BrowserBinding | null {
  if (!isSecret(key)) return null;
  return asBrowserBinding(database.prepare(
    `SELECT owner_id AS ownerId, binding_id AS bindingId FROM bindings WHERE digest = ?
      AND (? = 0 OR binding_id IN (SELECT binding_id FROM channel_keys))`,
  ).get(secretDigest(key), Number(channelOnly)));
}

export function issueBridgeTicket(database: StateDatabase, deviceKey: string, now = Date.now(), channelOnly = false): string | null {
  if (!isSecret(deviceKey)) return null;
  const ticket = createSecret();
  const { changes } = database.prepare(`
    INSERT INTO tickets(digest, binding_id, expires_at)
    SELECT ?, binding_id, ? FROM bindings WHERE digest = ?
      AND (? = 0 OR binding_id IN (SELECT binding_id FROM channel_keys))
    ON CONFLICT(binding_id) DO UPDATE SET digest = excluded.digest, expires_at = excluded.expires_at
  `).run(secretDigest(ticket), now + 30_000, secretDigest(deviceKey), Number(channelOnly));
  return changes ? ticket : null;
}

export function consumeBridgeTicket(database: StateDatabase, ticket: string, now = Date.now()): BrowserBinding | null {
  if (!isSecret(ticket)) return null;
  const bindingId = database.prepare(
    "DELETE FROM tickets WHERE digest = ? AND expires_at > ? RETURNING binding_id",
  ).get(secretDigest(ticket), now)?.binding_id;
  if (typeof bindingId !== "string") return null;
  return asBrowserBinding(database.prepare(
    "SELECT owner_id AS ownerId, binding_id AS bindingId FROM bindings WHERE binding_id = ?",
  ).get(bindingId));
}
