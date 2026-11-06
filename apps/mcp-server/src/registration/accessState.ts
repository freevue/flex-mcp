import type { StateDatabase } from "./stateDatabase.ts";
import type { AccessState } from "../access/types.ts";
import { asBrowserBinding } from "./stateDatabase.ts";

export function createAccessState(database: StateDatabase): AccessState {
  const caller = database.prepare("SELECT owner_id AS ownerId FROM agents WHERE caller_id = ?");
  const binding = database.prepare("SELECT owner_id AS ownerId, binding_id AS bindingId FROM bindings WHERE owner_id = ?");
  const removeCaller = database.prepare("DELETE FROM agents WHERE owner_id = ? AND caller_id = ?");
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
