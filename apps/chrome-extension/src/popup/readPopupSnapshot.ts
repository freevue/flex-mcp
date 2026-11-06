import { hasKeys, isRecord } from "../../../../shared/index.ts";
import type { PopupWorkSummary } from "../flex/workSummary.ts";
import type { PopupSnapshot } from "./types.ts";

function isMinute(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isSummary(value: unknown): value is PopupWorkSummary {
  return isRecord(value) && hasKeys(value, [
    "todayActualMinutes", "monthActualMinutes", "standardRemainingMinutes", "adjustedRemainingMinutes",
  ]) && isMinute(value.todayActualMinutes) && isMinute(value.monthActualMinutes)
    && (value.standardRemainingMinutes === null || isMinute(value.standardRemainingMinutes))
    && (value.adjustedRemainingMinutes === null || isMinute(value.adjustedRemainingMinutes));
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
    if ((value.flex === "unavailable" || value.flex === "registered") && value.summary === null) {
      return { kind: "connected", flex: value.flex, summary: null };
    }
    if (value.flex === "synthetic" && isSummary(value.summary)) return { kind: "connected", flex: "synthetic", summary: value.summary };
  }
  return null;
}
