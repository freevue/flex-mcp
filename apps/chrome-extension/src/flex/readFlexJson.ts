import { failure, hasKeys, isDate, isDateRange, isRecord, success } from "../../../../shared/index.ts";
import type { FlexRequestFailure, Outcome } from "../../../../shared/index.ts";
import type { FlexPageContext, FlexReadRequest } from "./types.ts";

function isReadRequest(request: FlexReadRequest): boolean {
  if (!isRecord(request)) return false;
  switch (request.kind) {
    case "currentUser": return hasKeys(request, ["kind"]);
    case "annualLeave":
    case "primaryCalendar":
      return hasKeys(request, ["kind", "userRef"]) && typeof request.userRef === "string" && request.userRef.length > 0;
    case "workHours":
      return hasKeys(request, ["kind", "userRef", "range"]) && typeof request.userRef === "string"
        && request.userRef.length > 0 && isDateRange(request.range);
    case "calendarEvents":
    case "recurringCalendarEvents":
      return hasKeys(request, ["kind", "calendarRef", "start", "endExclusive"])
        && typeof request.calendarRef === "string" && request.calendarRef.length > 0
        && isDate(request.start) && isDate(request.endExclusive) && request.start < request.endExclusive;
    default: return false;
  }
}

export async function readFlexJson(context: FlexPageContext, request: FlexReadRequest, signal: AbortSignal):
  Promise<Outcome<Record<string, unknown>, FlexRequestFailure>> {
  if (context.origin !== "https://flex.team" || signal.aborted || !isReadRequest(request)) return failure("FLEX_READ_FAILED");
  let stop = () => {};
  const stopped = new Promise<null>(resolve => { stop = () => resolve(null); });
  signal.addEventListener("abort", stop, { once: true });
  try {
    const reply = await Promise.race([context.read(request, signal), stopped]);
    if (signal.aborted || !isRecord(reply)) return failure("FLEX_READ_FAILED");
    if (reply.kind === "reauth") return failure("FLEX_REAUTH_REQUIRED");
    return reply.kind === "response" && isRecord(reply.value) ? success(reply.value) : failure("FLEX_READ_FAILED");
  } catch {
    return failure("FLEX_READ_FAILED");
  } finally {
    signal.removeEventListener("abort", stop);
  }
}
