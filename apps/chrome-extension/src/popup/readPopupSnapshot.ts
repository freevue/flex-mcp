import { hasKeys, isRecord, isWorkSummary } from "../../../../shared/index.ts";
import type { PopupSnapshot } from "./types.ts";

function isApprovalCode(value: unknown): value is string | null {
  return value === null || (typeof value === "string" && /^[0-9A-F]{4}(?:-[0-9A-F]{4}){2}$/.test(value));
}

export function readPopupSnapshot(value: unknown): PopupSnapshot | null {
  if (!isRecord(value)) return null;
  if (value.kind === "error" && hasKeys(value, ["kind"])) return { kind: "error" };
  if (
    value.kind === "disconnected" &&
    (hasKeys(value, ["kind", "canReconnect", "approvalCode"]) ||
      (hasKeys(value, ["kind", "canReconnect", "approvalCode", "needsFlex"]) && value.needsFlex === true)) &&
    typeof value.canReconnect === "boolean" &&
    isApprovalCode(value.approvalCode)
  ) {
    return {
      kind: "disconnected",
      canReconnect: value.canReconnect,
      approvalCode: value.approvalCode,
      ...(value.needsFlex === true ? { needsFlex: true } : {})
    };
  }
  if (
    value.kind === "connected" &&
    hasKeys(value, ["kind", "flex", "summary", "approvalCode", "inviteFailed"]) &&
    isApprovalCode(value.approvalCode) &&
    typeof value.inviteFailed === "boolean"
  ) {
    const invitation = { approvalCode: value.approvalCode, inviteFailed: value.inviteFailed };
    if (value.flex === "unavailable" && value.summary === null && value.approvalCode === null) {
      return { kind: "connected", flex: value.flex, summary: null, ...invitation };
    }
    if ((value.flex === "synthetic" || value.flex === "live") && isWorkSummary(value.summary)) {
      return { kind: "connected", flex: value.flex, summary: value.summary, ...invitation };
    }
  }
  return null;
}
