import { hasKeys, isRecord } from "../../../../shared/index.ts";
import type { PopupWorkSummary } from "../flex/workSummary.ts";
import type { PopupSnapshot } from "./types.ts";

function isMinute(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isSummary(value: unknown): value is PopupWorkSummary {
  const requiredMinutes = ["todayActualMinutes", "monthActualMinutes", "monthRecognizedMinutes"];
  const optionalMinutes = [
    "monthAnnualLeaveUsedMinutes", "monthAnnualLeaveRecognizedMinutes", "monthAnnualLeaveScheduledMinutes",
    "monthAnnualLeaveScheduledRecognizedMinutes", "monthRecognizedWithoutAnnualLeaveMinutes",
    "standardRemainingMinutes", "adjustedRemainingMinutes", "projectedStandardRemainingMinutes", "projectedAdjustedRemainingMinutes",
  ];
  return isRecord(value) && hasKeys(value, [...requiredMinutes, ...optionalMinutes])
    && requiredMinutes.every(field => isMinute(value[field]))
    && optionalMinutes.every(field => value[field] === null || isMinute(value[field]));
}

export function readPopupSnapshot(value: unknown): PopupSnapshot | null {
  if (!isRecord(value)) return null;
  if (value.kind === "error" && hasKeys(value, ["kind"])) return { kind: "error" };
  if (value.kind === "disconnected" && (hasKeys(value, ["kind", "canReconnect", "approvalCode"])
      || (hasKeys(value, ["kind", "canReconnect", "approvalCode", "needsFlex"]) && value.needsFlex === true))
    && typeof value.canReconnect === "boolean" && (value.approvalCode === null
      || (typeof value.approvalCode === "string" && /^[0-9A-F]{4}(?:-[0-9A-F]{4}){2}$/.test(value.approvalCode)))) {
    return { kind: "disconnected", canReconnect: value.canReconnect, approvalCode: value.approvalCode,
      ...(value.needsFlex === true ? { needsFlex: true } : {}) };
  }
  if (value.kind === "connected" && hasKeys(value, ["kind", "flex", "summary"])) {
    if (value.flex === "unavailable" && value.summary === null) {
      return { kind: "connected", flex: value.flex, summary: null };
    }
    if ((value.flex === "synthetic" || value.flex === "live") && isSummary(value.summary)) {
      return { kind: "connected", flex: value.flex, summary: value.summary };
    }
  }
  return null;
}
