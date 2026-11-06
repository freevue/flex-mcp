import type { IncomingMessage, ServerResponse } from "node:http";
import type { DatabaseSync } from "node:sqlite";
import { hasKeys, isRecord } from "../../../../shared/index.ts";
import { revokeAccess } from "../access/index.ts";
import type { RelayContext } from "../bridge/index.ts";
import { claimDevicePairing, isSecret, issueBridgeTicket, redeemPairingCode, startDevicePairing, verifyDeviceKey } from "../registration/index.ts";
import { readBearer, readJson, sendJson } from "./http.ts";

export async function handleRegistration(request: IncomingMessage, response: ServerResponse, database: DatabaseSync,
  relay: RelayContext): Promise<void> {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "METHOD_NOT_ALLOWED" });
  }
  if (request.url === "/bridge/pair/start") {
    const started = startDevicePairing(database);
    return sendJson(response, started ? 201 : 429, started ?? { error: "PAIRING_LIMIT" });
  }
  if (request.url === "/bridge/pair/claim") {
    const result = claimDevicePairing(database, readBearer(request));
    return sendJson(response, 200, result);
  }
  if (request.url === "/bridge/pair") {
    const input = await readJson(request, 1024);
    if (!isRecord(input) || !hasKeys(input, ["code"]) || !isSecret(input.code)) {
      response.setHeader("Connection", "close");
      return sendJson(response, 400, { error: "INVALID_PAIRING_REQUEST" });
    }
    const registration = redeemPairingCode(database, input.code);
    if (!registration) return sendJson(response, 403, { error: "INVALID_PAIRING_CODE" });
    return sendJson(response, 200, registration);
  }

  const key = readBearer(request);
  if (request.url === "/bridge/ticket") {
    const ticket = issueBridgeTicket(database, key);
    return ticket ? sendJson(response, 200, { ticket }) : sendJson(response, 401, { error: "INVALID_DEVICE_KEY" });
  }
  const binding = verifyDeviceKey(database, key);
  if (!binding) return sendJson(response, 401, { error: "INVALID_DEVICE_KEY" });
  const result = revokeAccess(binding, { kind: "profile", bindingId: binding.bindingId }, relay.access, relay.registry);
  if (!result.ok) return sendJson(response, 401, { error: "INVALID_DEVICE_KEY" });
  database.prepare("DELETE FROM device_pairing WHERE owner_id = ?").run(binding.ownerId);
  response.writeHead(204, { "Cache-Control": "no-store" }).end();
}
