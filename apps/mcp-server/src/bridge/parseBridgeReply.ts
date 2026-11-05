import { bridgeErrors, failure, hasKeys, isExpectedRange, isLeaveBalance, isRecord, isRequestId,
  isScheduleEvent, isTime, isWorkTotals, success, workFields } from "../../../../shared/index.ts";
import type { BridgeError, BridgeReply, FlexQuery, FlexResult, Outcome } from "../../../../shared/index.ts";

function isResult(value: unknown, query: FlexQuery): value is FlexResult {
  if (!isRecord(value)) return false;
  if (query.kind === "leave") {
    return hasKeys(value, ["asOf", "remaining", "usable"])
      && isTime(value.asOf) && isLeaveBalance(value.remaining) && isLeaveBalance(value.usable);
  }
  if (!isExpectedRange(value, query.range)) return false;
  const base = ["from", "to", "timezone"];
  if (query.kind === "schedule") {
    return hasKeys(value, [...base, "events"]) && Array.isArray(value.events) && value.events.every(isScheduleEvent);
  }
  return hasKeys(value, [...base, ...workFields]) && isWorkTotals(value);
}

function isBridgeError(value: unknown): value is BridgeError {
  return bridgeErrors.some(error => error === value);
}

export function parseBridgeReply(value: unknown, expectedQuery: FlexQuery): Outcome<BridgeReply, "INVALID_BRIDGE_MESSAGE"> {
  if (!isRecord(value) || !isRequestId(value.requestId)) return failure("INVALID_BRIDGE_MESSAGE");
  const { requestId } = value;
  if (hasKeys(value, ["requestId", "error"]) && isBridgeError(value.error)) return success({ requestId, error: value.error });
  if (hasKeys(value, ["requestId", "result"]) && isResult(value.result, expectedQuery)) return success({ requestId, result: value.result });
  return failure("INVALID_BRIDGE_MESSAGE");
}
