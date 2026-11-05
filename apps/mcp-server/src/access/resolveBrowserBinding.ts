import { failure, success } from "../../../../shared/index.ts";
import type { Outcome } from "../../../../shared/index.ts";
import type { AccessState, AuthorizedCaller, BrowserBinding } from "./types.ts";

export function resolveBrowserBinding(caller: AuthorizedCaller, access: AccessState):
  Outcome<BrowserBinding, "ACCESS_DENIED"> {
  const { binding } = access;
  if (!binding || binding.ownerId !== caller.ownerId || binding.profileId !== caller.profileId
    || !access.allowedCallers.has(caller.callerId)) return failure("ACCESS_DENIED");
  return success(binding);
}
