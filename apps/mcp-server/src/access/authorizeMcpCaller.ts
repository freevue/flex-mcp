import { failure, success } from "../../../../shared/index.ts";
import type { Outcome } from "../../../../shared/index.ts";
import type { AccessFailure, AccessState, AuthorizedCaller, VerifiedCallerIdentity } from "./types.ts";

export function authorizeMcpCaller(identity: VerifiedCallerIdentity | null, access: AccessState):
  Outcome<AuthorizedCaller, AccessFailure> {
  if (!identity) return failure("CALLER_UNVERIFIED");
  if (access.findOwner(identity.callerId) !== identity.ownerId) return failure("ACCESS_DENIED");
  const binding = access.findBinding(identity.ownerId);
  if (!binding) return failure("ACCESS_DENIED");
  return success({ callerId: identity.callerId, ...binding });
}
