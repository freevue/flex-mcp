import { failure, isQuery } from "../../../../shared/index.ts";
import type { BrowserQueryFailure, FlexQuery, FlexResult, Outcome } from "../../../../shared/index.ts";
import { readAnnualLeave } from "./readAnnualLeave.ts";
import { readCurrentUser } from "./readCurrentUser.ts";
import { readSchedule } from "./readSchedule.ts";
import { readWorkHours } from "./readWorkHours.ts";
import type { FlexPageContext, LocalBrowserBinding } from "./types.ts";

export async function runFlexQuery(context: FlexPageContext, query: FlexQuery, binding: LocalBrowserBinding, signal: AbortSignal):
  Promise<Outcome<FlexResult, BrowserQueryFailure>> {
  if (context.origin !== "https://flex.team") return failure("FLEX_TAB_UNAVAILABLE");
  if (!isQuery(query)) return failure("FLEX_READ_FAILED");
  const before = await readCurrentUser(context, signal);
  if (!before.ok) return before;
  if (before.value.userRef !== binding.userRef) return failure("FLEX_ACCOUNT_MISMATCH");

  const result = await (query.kind === "leave"
    ? readAnnualLeave(context, before.value, context.now?.() ?? new Date(), signal)
    : query.kind === "schedule"
      ? readSchedule(context, before.value, query.range, signal)
      : readWorkHours(context, before.value, query.range, signal));
  if (!result.ok) return result;
  const after = await readCurrentUser(context, signal);
  if (!after.ok) return after;
  return after.value.userRef === binding.userRef ? result : failure("FLEX_ACCOUNT_MISMATCH");
}
