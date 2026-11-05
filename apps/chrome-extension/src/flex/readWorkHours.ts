import { failure, isWorkTotals, success, timezone } from "../../../../shared/index.ts";
import type { DateRange, FlexReadFailure, Outcome, WorkHoursResult } from "../../../../shared/index.ts";
import { readFlexJson } from "./readFlexJson.ts";
import type { BrowserUser, FlexPageContext } from "./types.ts";

export async function readWorkHours(context: FlexPageContext, user: BrowserUser, range: DateRange, signal: AbortSignal):
  Promise<Outcome<WorkHoursResult, FlexReadFailure>> {
  const reply = await readFlexJson(context, { kind: "workHours", userRef: user.userRef, range }, signal);
  if (!reply.ok) return reply;
  if (reply.value.kind === "no-records") return failure("FLEX_NO_RECORDS");
  const { actualMinutes, recognizedMinutes, requiredAgreedMinutes, overtimeMinutes, timeOffMinutes } = reply.value;
  const totals = { actualMinutes, recognizedMinutes, requiredAgreedMinutes, overtimeMinutes, timeOffMinutes };
  if (!isWorkTotals(totals)) return failure("FLEX_READ_FAILED");
  return success({ ...range, timezone, ...totals });
}
