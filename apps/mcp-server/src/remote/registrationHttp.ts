import type { IncomingMessage, ServerResponse } from "node:http";
import type { DatabaseSync } from "node:sqlite";
import { revokeAccess } from "../access/index.ts";
import type { RelayContext } from "../bridge/index.ts";
import { claimDevicePairing, issueBridgeTicket, startDevicePairing, verifyDeviceKey } from "../registration/index.ts";
import { reconcileBrowserAccess } from "./browserSocket.ts";
import { readBearer, sendJson } from "./http.ts";

export function handleRegistration(request: IncomingMessage, response: ServerResponse, database: DatabaseSync,
  relay: RelayContext): void {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "METHOD_NOT_ALLOWED" });
  }
  if (request.url === "/bridge/pair/start") {
    const started = startDevicePairing(database, readBearer(request));
    return sendJson(response, started ? 201 : 429, started ?? { error: "PAIRING_LIMIT" });
  }
  if (request.url === "/bridge/pair/claim") {
    const result = claimDevicePairing(database, readBearer(request));
    if (result.status === "registered") reconcileBrowserAccess(relay);
    return sendJson(response, 200, result);
  }

  const key = readBearer(request);
  if (request.url === "/bridge/ticket") {
    const ticket = issueBridgeTicket(database, key, undefined, true);
    return ticket ? sendJson(response, 200, { ticket }) : sendJson(response, 401, { error: "INVALID_DEVICE_KEY" });
  }
  const binding = verifyDeviceKey(database, key);
  if (!binding) return sendJson(response, 401, { error: "INVALID_DEVICE_KEY" });
  const result = revokeAccess(binding, { kind: "profile", bindingId: binding.bindingId }, relay.access, relay.registry);
  if (!result.ok) return sendJson(response, 401, { error: "INVALID_DEVICE_KEY" });
  database.prepare("DELETE FROM channel_pairing WHERE replaces_binding_id = ?").run(binding.bindingId);
  response.writeHead(204, { "Cache-Control": "no-store" }).end();
}
