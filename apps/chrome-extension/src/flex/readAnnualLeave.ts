import type { AnnualLeaveResult, FlexReadFailure, Outcome } from "../../../../shared/index.ts";
import { parseAnnualLeave } from "./parseAnnualLeave.ts";
import { readFlexJson } from "./readFlexJson.ts";
import type { BrowserUser, FlexPageContext } from "./types.ts";

export async function readAnnualLeave(context: FlexPageContext, user: BrowserUser, asOf: Date, signal: AbortSignal):
  Promise<Outcome<AnnualLeaveResult, FlexReadFailure>> {
  const reply = await readFlexJson(context, { kind: "annualLeave", userRef: user.userRef }, signal);
  return reply.ok ? parseAnnualLeave(reply.value, asOf) : reply;
}
