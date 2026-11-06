import type { StateDatabase } from "./stateDatabase.ts";
import type { AccessState } from "../access/types.ts";
import { asBrowserBinding } from "./stateDatabase.ts";

export function createAccessState(database: StateDatabase, channelOnly = false): AccessState {
  const caller = database.prepare(channelOnly
    ? "SELECT owner_id AS ownerId FROM channel_connections JOIN bindings USING(binding_id) WHERE channel_connections.digest = ?"
    : "SELECT owner_id AS ownerId FROM agents WHERE caller_id = ?");
  const binding = database.prepare(channelOnly
    ? "SELECT owner_id AS ownerId, binding_id AS bindingId FROM bindings JOIN channel_connections USING(binding_id) WHERE owner_id = ?"
    : "SELECT owner_id AS ownerId, binding_id AS bindingId FROM bindings WHERE owner_id = ?");
  const removeCaller = database.prepare(channelOnly
    ? "DELETE FROM channel_connections WHERE binding_id IN (SELECT binding_id FROM bindings WHERE owner_id = ?) AND digest = ?"
    : "DELETE FROM agents WHERE owner_id = ? AND caller_id = ?");
  const removeBinding = database.prepare("DELETE FROM bindings WHERE owner_id = ? AND binding_id = ?");
  return {
    findOwner: callerId => {
      const ownerId = caller.get(callerId)?.ownerId;
      return typeof ownerId === "string" ? ownerId : null;
    },
    findBinding: ownerId => asBrowserBinding(binding.get(ownerId)),
    removeCaller: (ownerId, callerId) => Boolean(removeCaller.run(ownerId, callerId).changes),
    removeBinding: (ownerId, bindingId) => Boolean(removeBinding.run(ownerId, bindingId).changes),
  };
}
