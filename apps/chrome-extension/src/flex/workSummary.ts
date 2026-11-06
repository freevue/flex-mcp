import { shiftDate } from "../../../../shared/shiftDate.ts";
import type { DateRange } from "../../../../shared/index.ts";

export type WorkSummaryInput = {
  todayActualMinutes: number;
  monthActualMinutes: number;
  monthRecognizedMinutes: number;
  monthRequiredMinutes: number | null;
  restTargetMinutes: number | null;
};

export type PopupWorkSummary = Pick<WorkSummaryInput, "todayActualMinutes" | "monthActualMinutes"> & {
  standardRemainingMinutes: number | null;
  adjustedRemainingMinutes: number | null;
};

export function calculateWorkSummary(input: WorkSummaryInput): PopupWorkSummary {
  const { todayActualMinutes, monthActualMinutes, monthRecognizedMinutes, monthRequiredMinutes, restTargetMinutes } = input;
  const standardRemainingMinutes = monthRequiredMinutes === null ? null
    : Math.max(0, monthRequiredMinutes - monthRecognizedMinutes);
  const adjustedRemainingMinutes = monthRequiredMinutes === null || restTargetMinutes === null ? null
    : Math.max(0, Math.max(0, monthRequiredMinutes - restTargetMinutes) - monthRecognizedMinutes);
  return { todayActualMinutes, monthActualMinutes, standardRemainingMinutes, adjustedRemainingMinutes };
}

export type WorkWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function calculateRestTargetMinutes(range: DateRange, restWeekdays: readonly WorkWeekday[],
  dailyTargets: Readonly<Record<string, number | null>>): number | null {
  if (!restWeekdays.length) return 0;
  let minutes = 0;
  for (let date = range.from; date <= range.to; date = shiftDate(date, 1)) {
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    if (!restWeekdays.some(restWeekday => restWeekday === weekday)) continue;
    const target = dailyTargets[date];
    if (typeof target !== "number" || !Number.isSafeInteger(target) || target < 0) return null;
    minutes += target;
  }
  return minutes;
}
