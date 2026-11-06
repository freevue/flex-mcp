import { shiftDate } from "../../../../shared/shiftDate.ts";
import { timezone } from "../../../../shared/index.ts";
import type { BridgeReply, BridgeRequest } from "../../../../shared/index.ts";

export function createSyntheticReply(request: BridgeRequest, bindingId: string): BridgeReply {
  const { requestId, query } = request;
  if (query.kind === "leave") {
    const balance = { days: 1, totalMinutes: 480, breakdown: { days: 1, hours: 0, minutes: 0 } };
    return { requestId, result: { asOf: new Date().toISOString(), remaining: balance, usable: balance } };
  }
  if (query.kind === "schedule") {
    return { requestId, result: { ...query.range, timezone, events: [{
      title: `합성 일정 ${bindingId.slice(0, 8)}`, type: "synthetic", status: "synthetic", allDay: true,
      startAt: query.range.from, endAtExclusive: shiftDate(query.range.from, 1),
    }] } };
  }
  return { requestId, result: { ...query.range, timezone,
    actualMinutes: 480, recognizedMinutes: 480, requiredAgreedMinutes: 480, overtimeMinutes: 0, timeOffMinutes: 0,
  } };
}
