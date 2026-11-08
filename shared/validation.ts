import { timezone, workFields, workSummaryNullableFields, workSummaryRequiredFields } from "./contracts.ts";
import type { BridgeQuery, DateRange, FlexQuery, LeaveBalance, ScheduleEvent, WorkSummaryResult, WorkTotals } from "./contracts.ts";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function hasKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

export function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function isTime(value: unknown): value is string {
  return (
    typeof value === "string" &&
    isDate(value.slice(0, 10)) &&
    /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

export function isDateRange(value: unknown): value is DateRange {
  return (
    isRecord(value) &&
    hasKeys(value, ["from", "to"]) &&
    isDate(value.from) &&
    isDate(value.to) &&
    value.from <= value.to &&
    Date.parse(value.to) - Date.parse(value.from) <= 30 * 86_400_000
  );
}

export function isQuery(value: unknown): value is FlexQuery {
  if (!isRecord(value)) return false;
  if (value.kind === "leave") return hasKeys(value, ["kind"]);
  return (value.kind === "schedule" || value.kind === "work") && hasKeys(value, ["kind", "range"]) && isDateRange(value.range);
}

export function isBridgeQuery(value: unknown): value is BridgeQuery {
  if (isRecord(value) && value.kind === "companyHolidays") return hasKeys(value, ["kind", "range"]) && isDateRange(value.range);
  return isQuery(value) || (isRecord(value) && (value.kind === "summary" || value.kind === "workStatus") && hasKeys(value, ["kind"]));
}

export function isWorkSummary(value: unknown): value is WorkSummaryResult {
  const isMinute = (minutes: unknown): boolean => typeof minutes === "number" && Number.isSafeInteger(minutes) && minutes >= 0;
  return (
    isRecord(value) &&
    hasKeys(value, [...workSummaryRequiredFields, ...workSummaryNullableFields]) &&
    workSummaryRequiredFields.every((field) => isMinute(value[field])) &&
    workSummaryNullableFields.every((field) => value[field] === null || isMinute(value[field]))
  );
}

export function isRequestId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value);
}

export function isLeaveBalance(value: unknown): value is LeaveBalance {
  if (!isRecord(value) || !hasKeys(value, ["days", "totalMinutes", "breakdown"])) return false;
  const { breakdown } = value;
  return (
    Number.isFinite(value.days) &&
    Number.isFinite(value.totalMinutes) &&
    isRecord(breakdown) &&
    hasKeys(breakdown, ["days", "hours", "minutes"]) &&
    Object.values(breakdown).every(Number.isFinite)
  );
}

export function isScheduleEvent(value: unknown): value is ScheduleEvent {
  if (!isRecord(value) || !hasKeys(value, ["title", "type", "status", "allDay", "startAt", "endAtExclusive"])) return false;
  const { title, type, status, allDay, startAt, endAtExclusive } = value;
  if (typeof title !== "string" || typeof type !== "string" || typeof status !== "string") return false;
  if (allDay === true) return isDate(startAt) && isDate(endAtExclusive) && startAt < endAtExclusive;
  return allDay === false && isTime(startAt) && isTime(endAtExclusive) && Date.parse(startAt) < Date.parse(endAtExclusive);
}

export function isWorkTotals(value: Record<string, unknown>): value is WorkTotals {
  return workFields.every((field) => Number.isFinite(value[field]));
}

export function isExpectedRange(value: Record<string, unknown>, range: DateRange): boolean {
  return value.from === range.from && value.to === range.to && value.timezone === timezone;
}

export function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function isFlexUrl(value: string): boolean {
  const url = parseUrl(value);
  return url?.origin === "https://flex.team" && !url.username && !url.password;
}
