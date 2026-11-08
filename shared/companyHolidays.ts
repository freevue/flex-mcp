import { timezone } from "./contracts.ts";
import type { DateRange } from "./contracts.ts";
import { hasKeys, isDate, isExpectedRange, isRecord } from "./validation.ts";

export type CompanyHolidaysResult = DateRange & {
  timezone: typeof timezone;
  holidays: { date: string; name: string; type: "PUBLIC_HOLIDAY" | "CUSTOM_HOLIDAY" }[];
};

/** 기간과 회사 휴일 결과를 검사합니다. @see wiki/unit/shared/isCompanyHolidays.md */
export function isCompanyHolidays(value: unknown, range: DateRange): value is CompanyHolidaysResult {
  if (!isRecord(value) || !hasKeys(value, ["from", "to", "timezone", "holidays"]) || !isExpectedRange(value, range)) return false;
  if (!Array.isArray(value.holidays)) return false;
  let previousDate = range.from;
  for (const item of value.holidays as unknown[]) {
    if (!isRecord(item) || !hasKeys(item, ["date", "name", "type"]) || !isDate(item.date)) return false;
    if (item.date < previousDate || item.date > range.to) return false;
    if (item.type !== "PUBLIC_HOLIDAY" && item.type !== "CUSTOM_HOLIDAY") return false;
    if (typeof item.name !== "string" || !item.name.trim() || item.name.length > 120 || /[\r\n\p{Cc}\p{Zl}\p{Zp}]/u.test(item.name)) return false;
    previousDate = item.date;
  }
  return true;
}
