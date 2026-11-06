import { failure, success } from "../../../../shared/index.ts";
import type { FlexRequestFailure, Outcome } from "../../../../shared/index.ts";
import type { ApprovedBrowserTarget, BrowserUser, LocalBrowserBinding } from "../flex/index.ts";

type BindingFailure = FlexRequestFailure | "BINDING_CANCELLED";

export function confirmBrowserBinding(confirmed: boolean, approved: ApprovedBrowserTarget,
  currentUser: Outcome<BrowserUser, FlexRequestFailure>): Outcome<LocalBrowserBinding, BindingFailure> {
  if (!confirmed) return failure("BINDING_CANCELLED");
  return currentUser.ok ? success({ bindingId: approved.bindingId, userRef: currentUser.value.userRef }) : currentUser;
}
