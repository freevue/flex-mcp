import { shiftDate } from "../../../../shared/shiftDate.ts";
import type { DateRange, WorkSummaryResult } from "../../../../shared/index.ts";

const seoulDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
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
    fullMonth: { from, to: end.toISOString().slice(0, 10) }
  };
}

export type WorkSummaryInput = {
  todayActualMinutes: number;
  monthActualMinutes: number;
  monthRecognizedMinutes: number;
  monthAnnualLeaveUsedMinutes: number | null;
  monthAnnualLeaveRecognizedMinutes: number | null;
  monthAnnualLeaveScheduledMinutes: number | null;
  monthAnnualLeaveScheduledRecognizedMinutes: number | null;
  monthRequiredMinutes: number | null;
  restTargetMinutes: number | null;
};

export type PopupWorkSummary = WorkSummaryResult;

export function calculateWorkSummary(input: WorkSummaryInput): PopupWorkSummary {
  const { monthRequiredMinutes, restTargetMinutes, ...totals } = input;
  const { monthRecognizedMinutes, monthAnnualLeaveRecognizedMinutes: annualLeaveCredit } = totals;
  const verifiedCredit = annualLeaveCredit !== null && annualLeaveCredit <= monthRecognizedMinutes ? annualLeaveCredit : null;
  const standardRemainingMinutes = monthRequiredMinutes === null ? null : Math.max(0, monthRequiredMinutes - monthRecognizedMinutes);
  const adjustedRemainingMinutes =
    monthRequiredMinutes === null || restTargetMinutes === null
      ? null
      : Math.max(0, Math.max(0, monthRequiredMinutes - restTargetMinutes) - monthRecognizedMinutes);
  const { monthAnnualLeaveScheduledMinutes: scheduled, monthAnnualLeaveScheduledRecognizedMinutes: scheduledCredit } = totals;
  const verifiedScheduledCredit =
    scheduledCredit !== null && Number.isSafeInteger(scheduledCredit) && scheduledCredit >= 0 && scheduled !== null && scheduledCredit <= scheduled
      ? scheduledCredit
      : null;
  const afterScheduledLeave = (remaining: number | null) =>
    remaining === null || verifiedScheduledCredit === null ? null : Math.max(0, remaining - verifiedScheduledCredit);
  return {
    ...totals,
    monthAnnualLeaveRecognizedMinutes: verifiedCredit,
    monthAnnualLeaveScheduledRecognizedMinutes: verifiedScheduledCredit,
    monthRecognizedWithoutAnnualLeaveMinutes: verifiedCredit === null ? null : monthRecognizedMinutes - verifiedCredit,
    standardRemainingMinutes,
    adjustedRemainingMinutes,
    projectedStandardRemainingMinutes: afterScheduledLeave(standardRemainingMinutes),
    projectedAdjustedRemainingMinutes: afterScheduledLeave(adjustedRemainingMinutes)
  };
}

export type WorkWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function calculateRestTargetMinutes(
  range: DateRange,
  restWeekdays: readonly WorkWeekday[],
  dailyTargets: Readonly<Record<string, number | null>>
): number | null {
  if (!restWeekdays.length) return 0;
  let minutes = 0;
  for (let date = range.from; date <= range.to; date = shiftDate(date, 1)) {
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    if (!restWeekdays.some((restWeekday) => restWeekday === weekday)) continue;
    const target = dailyTargets[date];
    if (typeof target !== "number" || !Number.isSafeInteger(target) || target < 0) return null;
    minutes += target;
  }
  return minutes;
}
