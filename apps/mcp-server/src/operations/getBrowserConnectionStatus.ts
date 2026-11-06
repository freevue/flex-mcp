import { failure, success } from "../../../../shared/index.ts";
import type { Outcome } from "../../../../shared/index.ts";
import type { AccessFailure, VerifiedCallerIdentity } from "../access/index.ts";
import type { RelayContext } from "../bridge/index.ts";

export const browserConnectionStates = ["unregistered", "offline", "online"] as const;
export type BrowserConnectionStatus = { status: typeof browserConnectionStates[number] };

export function getBrowserConnectionStatus(identity: VerifiedCallerIdentity | null, relay: RelayContext):
  Outcome<BrowserConnectionStatus, AccessFailure> {
  if (!identity) return failure("CALLER_UNVERIFIED");
  if (relay.access.findOwner(identity.callerId) !== identity.ownerId) return failure("ACCESS_DENIED");

  const binding = relay.access.findBinding(identity.ownerId);
  if (!binding) return success({ status: "unregistered" });

  const connection = relay.registry.active.get(binding.bindingId);
  return success({ status: connection?.ownerId === binding.ownerId && connection.isOpen() ? "online" : "offline" });
}
