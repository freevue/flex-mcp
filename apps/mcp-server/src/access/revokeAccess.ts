import { failure, success } from "../../../../shared/index.ts";
import type { Outcome } from "../../../../shared/index.ts";
import type { BridgeRegistry } from "../bridge/types.ts";
import type { AccessState, RevocationTarget, VerifiedOwnerIdentity } from "./types.ts";

export function revokeAccess(owner: VerifiedOwnerIdentity | null, target: RevocationTarget,
  access: AccessState, registry: BridgeRegistry): Outcome<void, "ACCESS_DENIED"> {
  if (!owner) return failure("ACCESS_DENIED");
  const { ownerId } = owner;
  const removed = target.kind === "caller"
    ? access.removeCaller(ownerId, target.callerId) : access.removeBinding(ownerId, target.bindingId);
  if (!removed) return failure("ACCESS_DENIED");

  for (const pending of registry.pending.values()) {
    if (pending.caller.ownerId !== ownerId) continue;
    const matches = target.kind === "caller" ? pending.caller.callerId === target.callerId
      : pending.caller.bindingId === target.bindingId;
    if (matches) pending.finish(failure("ACCESS_DENIED"));
  }
  if (target.kind === "profile") {
    const connection = registry.active.get(target.bindingId);
    if (connection?.ownerId === ownerId) {
      registry.active.delete(target.bindingId);
      connection.close();
    }
  }
  return success(undefined);
}
