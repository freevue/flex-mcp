import { shiftDate } from "../../../../shared/shiftDate.ts";
import { demoWorkStatus, timezone } from "../../../../shared/index.ts";
import type { BridgeReply, BridgeRequest, CompanyHolidaysResult } from "../../../../shared/index.ts";
import { createDemoWorkTotals, readDemoWorkSummary } from "../flex/demoWorkSummary.ts";

export async function createSyntheticReply(request: BridgeRequest, bindingId: string, signal: AbortSignal): Promise<BridgeReply> {
  const { requestId, query } = request;
  if (query.kind === "companyHolidays") {
    const { range } = query;
    const year = range.to.slice(0, 4);
    const examples: CompanyHolidaysResult["holidays"] = [
      { date: `${year}-01-01`, name: "예시 공휴일", type: "PUBLIC_HOLIDAY" },
      { date: `${year}-01-02`, name: "예시 회사 휴일", type: "CUSTOM_HOLIDAY" }
    ];
    const holidays = examples.filter(({ date }) => date >= range.from && date <= range.to);
    return { requestId, result: { ...range, timezone, holidays } };
  }
  if (query.kind === "workStatus") return { requestId, result: demoWorkStatus };
  if (query.kind === "summary") {
    const summary = await readDemoWorkSummary(bindingId, signal);
    if (!summary) return { requestId, error: "FLEX_READ_FAILED" };
    const { planning, ...result } = summary;
    return { requestId, result };
  }
  if (query.kind === "leave") {
    const balance = { days: 1, totalMinutes: 480, breakdown: { days: 1, hours: 0, minutes: 0 } };
    return { requestId, result: { asOf: new Date().toISOString(), remaining: balance, usable: balance } };
  }
  if (query.kind === "schedule") {
    return {
      requestId,
      result: {
        ...query.range,
        timezone,
        events: [
          {
            title: `합성 일정 ${bindingId.slice(0, 8)}`,
            type: "synthetic",
            status: "synthetic",
            allDay: true,
            startAt: query.range.from,
            endAtExclusive: shiftDate(query.range.from, 1)
          }
        ]
      }
    };
  }
  return { requestId, result: { ...query.range, timezone, ...createDemoWorkTotals(query.range) } };
}
