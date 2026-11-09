import { isDateRange } from "../../../../shared/index.ts";
import type { DateRange } from "../../../../shared/index.ts";
import { shiftDate } from "../../../../shared/shiftDate.ts";

/** 놀수를 뺀 남은 근무일을 셉니다. @see wiki/unit/flex/countRemainingWorkdays.md */
export function countRemainingWorkdays(range: DateRange, dailyTargets: ReadonlyMap<string, number>, nolsuDates: readonly string[]): number | null {
  if (!isDateRange(range)) return null;
  let count = 0;
  for (let date = range.from; ; date = shiftDate(date, 1)) {
    const target = dailyTargets.get(date);
    if (target === undefined || !Number.isSafeInteger(target) || target < 0) return null;
    if (target > 0 && !nolsuDates.includes(date)) count += 1;
    if (date === range.to) return count;
  }
}
