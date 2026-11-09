import { hasKeys, isRecord, isWorkStatusResult, isWorkSummary } from "../../../../shared/index.ts";
import type { PopupSnapshot } from "./types.ts";
import type { PopupWorkSummary } from "../flex/workSummary.ts";

function readSummary(value: unknown): PopupWorkSummary | null {
  if (!isRecord(value)) return null;
  const { planning, ...summary } = value;
  if (!isWorkSummary(summary)) return null;
  if (planning == null) return { ...summary, planning: null };
  if (!isRecord(planning) || !hasKeys(planning, ["remainingWorkdays", "recommendedDailyMinutes"])) return null;
  const { remainingWorkdays, recommendedDailyMinutes } = planning;
  if (typeof remainingWorkdays !== "number" || !Number.isInteger(remainingWorkdays) || remainingWorkdays < 0 || remainingWorkdays > 31) return null;
  if (
    recommendedDailyMinutes !== null &&
    (typeof recommendedDailyMinutes !== "number" || !Number.isSafeInteger(recommendedDailyMinutes) || recommendedDailyMinutes < 0)
  )
    return null;
  return { ...summary, planning: { remainingWorkdays, recommendedDailyMinutes } };
}

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
    hasKeys(value, ["kind", "flex", "summary", "workStatus", "approvalCode", "inviteFailed"]) &&
    isApprovalCode(value.approvalCode) &&
    typeof value.inviteFailed === "boolean"
  ) {
    const status = { status: value.workStatus };
    const invitation = {
      approvalCode: value.approvalCode,
      inviteFailed: value.inviteFailed,
      workStatus: isWorkStatusResult(status) ? status.status : ("unknown" as const)
    };
    if (value.flex === "unavailable" && value.summary === null && value.approvalCode === null) {
      return { kind: "connected", flex: value.flex, summary: null, ...invitation };
    }
    if (value.flex === "synthetic" || value.flex === "live") {
      const summary = readSummary(value.summary);
      if (summary) return { kind: "connected", flex: value.flex, summary, ...invitation };
    }
  }
  return null;
}
