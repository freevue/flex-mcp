import type { DatabaseSync } from "node:sqlite";
import type { BrowserBinding } from "../access/types.ts";
import { asBrowserBinding, createSecret, isSecret, secretDigest } from "./database.ts";

export function verifyDeviceKey(database: DatabaseSync, key: string): BrowserBinding | null {
  if (!isSecret(key)) return null;
  return asBrowserBinding(database.prepare(
    "SELECT owner_id AS ownerId, binding_id AS bindingId FROM bindings WHERE digest = ?",
  ).get(secretDigest(key)));
}

export function issueBridgeTicket(database: DatabaseSync, deviceKey: string, now = Date.now()): string | null {
  if (!isSecret(deviceKey)) return null;
  const ticket = createSecret();
  const { changes } = database.prepare(`
    INSERT INTO tickets(digest, binding_id, expires_at)
    SELECT ?, binding_id, ? FROM bindings WHERE digest = ?
    ON CONFLICT(binding_id) DO UPDATE SET digest = excluded.digest, expires_at = excluded.expires_at
  `).run(secretDigest(ticket), now + 30_000, secretDigest(deviceKey));
  return changes ? ticket : null;
}

export function consumeBridgeTicket(database: DatabaseSync, ticket: string, now = Date.now()): BrowserBinding | null {
  if (!isSecret(ticket)) return null;
  const bindingId = database.prepare(
    "DELETE FROM tickets WHERE digest = ? AND expires_at > ? RETURNING binding_id",
  ).get(secretDigest(ticket), now)?.binding_id;
  if (typeof bindingId !== "string") return null;
  return asBrowserBinding(database.prepare(
    "SELECT owner_id AS ownerId, binding_id AS bindingId FROM bindings WHERE binding_id = ?",
  ).get(bindingId));
}
