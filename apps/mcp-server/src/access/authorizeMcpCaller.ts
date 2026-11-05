import { failure, success } from "../../../../shared/index.ts";
import type { Outcome } from "../../../../shared/index.ts";
import type { AccessFailure, AccessState, AuthorizedCaller, VerifiedCallerIdentity } from "./types.ts";

export function authorizeMcpCaller(identity: VerifiedCallerIdentity | null, access: AccessState):
  Outcome<AuthorizedCaller, AccessFailure> {
  if (!identity) return failure("CALLER_UNVERIFIED");
  if (!access.binding || !access.allowedCallers.has(identity.callerId)) return failure("ACCESS_DENIED");
  return success({ callerId: identity.callerId, ownerId: access.binding.ownerId, profileId: access.binding.profileId });
}
