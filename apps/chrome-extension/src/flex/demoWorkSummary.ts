import { shiftDate } from "../../../../shared/shiftDate.ts";
import type { DateRange, WorkTotals } from "../../../../shared/index.ts";
import { runFlexQuery } from "./runFlexQuery.ts";
import { calculateRestTargetMinutes, calculateWorkSummary } from "./workSummary.ts";
import type { FlexReadRequest } from "./types.ts";
import type { PopupWorkSummary } from "./workSummary.ts";

const seoulDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
});

export function getWorkSummaryRanges(now: Date) {
  const today = seoulDate.format(now);
  const month = today.slice(0, 7);
  const end = new Date(`${month}-01T00:00:00Z`);
  end.setUTCMonth(end.getUTCMonth() + 1, 0);
  const from = `${month}-01`;
  return {
    today: { from: today, to: today },
    monthToDate: { from, to: today },
    fullMonth: { from, to: end.toISOString().slice(0, 10) },
  };
}

export function createDemoWorkTotals(range: DateRange, now = new Date()): WorkTotals {
  const { today, fullMonth } = getWorkSummaryRanges(now);
  const days = (Date.parse(range.to) - Date.parse(range.from)) / 86_400_000 + 1;
  const isToday = range.from === today.from && range.to === today.to;
  const actualMinutes = isToday ? 320 : Math.min(5_520, days * 480);
  return {
    actualMinutes,
    recognizedMinutes: isToday ? 320 : Math.min(5_400, actualMinutes),
    requiredAgreedMinutes: range.from === fullMonth.from && range.to === fullMonth.to ? 9_600 : days * 480,
    overtimeMinutes: 0,
    timeOffMinutes: 0,
  };
}

export async function readDemoWorkSummary(bindingId: string, signal: AbortSignal, now = new Date()):
  Promise<PopupWorkSummary | null> {
  const userRef = "synthetic-current-user";
  const context = {
    origin: "https://flex.team",
    read: async (request: FlexReadRequest) => {
      if (request.kind === "currentUser") return { kind: "response", value: { userRef } };
      if (request.kind === "workHours") return { kind: "response", value: createDemoWorkTotals(request.range, now) };
      return null;
    },
  };
  const { today, monthToDate, fullMonth } = getWorkSummaryRanges(now);
  const binding = { userRef, bindingId };
  const [daily, cumulative, target] = await Promise.all([today, monthToDate, fullMonth].map(range =>
    runFlexQuery(context, { kind: "work", range }, binding, signal)));
  if (!daily.ok || !cumulative.ok || !target.ok || !("actualMinutes" in daily.value)
    || !("actualMinutes" in cumulative.value) || !("requiredAgreedMinutes" in target.value)) return null;
  const restWeekday = 3;
  const demoRestDates = Array.from({ length: Number(fullMonth.to.slice(-2)) }, (_value, index) => shiftDate(fullMonth.from, index))
    .filter(date => new Date(`${date}T00:00:00Z`).getUTCDay() === restWeekday);
  const demoTargets = Object.fromEntries(demoRestDates.map((date, index) => [date, index < 2 ? 480 : 0]));
  return calculateWorkSummary({
    todayActualMinutes: daily.value.actualMinutes,
    monthActualMinutes: cumulative.value.actualMinutes,
    monthRecognizedMinutes: cumulative.value.recognizedMinutes,
    monthRequiredMinutes: target.value.requiredAgreedMinutes,
    restTargetMinutes: calculateRestTargetMinutes(fullMonth, [restWeekday], demoTargets),
  });
}
