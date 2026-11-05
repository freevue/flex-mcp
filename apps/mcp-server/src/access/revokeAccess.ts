import { failure, success } from "../../../../shared/index.ts";
import type { Outcome } from "../../../../shared/index.ts";
import type { BridgeRegistry } from "../bridge/types.ts";
import type { AccessState, RevocationTarget, VerifiedOwnerIdentity } from "./types.ts";

export function revokeAccess(owner: VerifiedOwnerIdentity | null, target: RevocationTarget,
  access: AccessState, registry: BridgeRegistry): Outcome<void, "ACCESS_DENIED"> {
  const { binding } = access;
  if (!owner || !binding || binding.ownerId !== owner.ownerId) return failure("ACCESS_DENIED");

  if (target.kind === "caller") {
    if (!access.allowedCallers.has(target.callerId)) return failure("ACCESS_DENIED");
    access.allowedCallers = new Set([...access.allowedCallers].filter(callerId => callerId !== target.callerId));
    for (const pending of registry.pending.values()) {
      if (pending.caller.ownerId === owner.ownerId && pending.caller.callerId === target.callerId) {
        pending.finish(failure("ACCESS_DENIED"));
      }
    }
    return success(undefined);
  }

  if (binding.profileId !== target.profileId) return failure("ACCESS_DENIED");
  access.binding = null;
  access.allowedCallers = new Set();
  for (const pending of registry.pending.values()) {
    if (pending.caller.ownerId === owner.ownerId && pending.caller.profileId === target.profileId) {
      pending.finish(failure("ACCESS_DENIED"));
    }
  }
  const connection = registry.active.get(target.profileId);
  if (connection?.ownerId === owner.ownerId) {
    registry.active.delete(target.profileId);
    connection.close();
  }
  return success(undefined);
}
