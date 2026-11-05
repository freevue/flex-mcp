import { failure, isRecord, isRequestId, success } from "../../../../shared/index.ts";
import type { Outcome } from "../../../../shared/index.ts";
import type { BrowserBinding } from "../access/types.ts";
import { parseBridgeReply } from "./parseBridgeReply.ts";
import type { BridgeRegistry, BrowserConnection } from "./types.ts";

export function attachBrowserBridge(binding: BrowserBinding, connection: BrowserConnection, registry: BridgeRegistry):
  Outcome<BrowserConnection, "ACCESS_DENIED"> {
  const { profileId, ownerId } = binding;
  if (connection.profileId !== profileId || connection.ownerId !== ownerId) return failure("ACCESS_DENIED");
  const previous = registry.active.get(profileId);
  if (previous === connection) return success(connection);

  function disconnect(closed: BrowserConnection) {
    if (registry.active.get(profileId) === closed) registry.active.delete(profileId);
    for (const pending of registry.pending.values()) {
      if (pending.connection === closed) pending.finish(failure("BROWSER_OFFLINE"));
    }
  }

  registry.active.set(profileId, connection);
  connection.onClose(() => disconnect(connection));
  connection.onReply(value => {
    if (registry.active.get(profileId) !== connection || !isRecord(value) || !isRequestId(value.requestId)) return;
    const pending = registry.pending.get(value.requestId);
    if (!pending || pending.connection !== connection) return;
    const reply = parseBridgeReply(value, pending.query);
    if (!reply.ok) return pending.finish(reply);
    pending.finish("error" in reply.value ? failure(reply.value.error) : success(reply.value.result));
  });

  if (previous) {
    disconnect(previous);
    previous.close();
  }
  return success(connection);
}
