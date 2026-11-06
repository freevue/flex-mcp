import { failure, success } from "../../../../shared/index.ts";
import type { Outcome } from "../../../../shared/index.ts";
import type { AccessState, AuthorizedCaller, BrowserBinding } from "./types.ts";

export function resolveBrowserBinding(caller: AuthorizedCaller, access: AccessState):
  Outcome<BrowserBinding, "ACCESS_DENIED"> {
  if (access.findOwner(caller.callerId) !== caller.ownerId) return failure("ACCESS_DENIED");
  const binding = access.findBinding(caller.ownerId);
  if (!binding || binding.bindingId !== caller.bindingId) return failure("ACCESS_DENIED");
  return success(binding);
}
