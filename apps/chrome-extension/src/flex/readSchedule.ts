import { failure, isDateRange, isRecord, isScheduleEvent, success, timezone } from "../../../../shared/index.ts";
import type { DateRange, FlexRequestFailure, Outcome, ScheduleEvent, ScheduleResult } from "../../../../shared/index.ts";
import { shiftDate } from "../../../../shared/shiftDate.ts";
import { readFlexJson } from "./readFlexJson.ts";
import type { BrowserUser, FlexPageContext } from "./types.ts";

function instant(value: string, allDay: boolean): number {
  return Date.parse(allDay ? `${value}T00:00:00+09:00` : value);
}

function selectEvents(values: readonly unknown[], calendarRef: string, range: DateRange, endExclusive: string) {
  const events = new Map<string, ScheduleEvent>();
  const start = instant(range.from, true);
  const end = instant(endExclusive, true);
  for (const value of values) {
    if (!isRecord(value) || value.calendarRef !== calendarRef || typeof value.eventRef !== "string" || !value.eventRef) return null;
    const { title, type, status, allDay, startAt, endAtExclusive } = value;
    const event = { title, type, status, allDay, startAt, endAtExclusive };
    if (!isScheduleEvent(event)) return null;
    const eventStart = instant(event.startAt, event.allDay);
    if (eventStart >= end || instant(event.endAtExclusive, event.allDay) <= start) continue;
    const key = JSON.stringify([value.eventRef, eventStart]);
    if (!events.has(key)) events.set(key, event);
  }
  return [...events.values()].sort((first, second) =>
    instant(first.startAt, first.allDay) - instant(second.startAt, second.allDay));
}

export async function readSchedule(context: FlexPageContext, user: BrowserUser, range: DateRange, signal: AbortSignal):
  Promise<Outcome<ScheduleResult, FlexRequestFailure>> {
  if (!isDateRange(range)) return failure("FLEX_READ_FAILED");
  const calendar = await readFlexJson(context, { kind: "primaryCalendar", userRef: user.userRef }, signal);
  if (!calendar.ok) return calendar;
  const { calendarRef, ownerRef, primary } = calendar.value;
  if (typeof calendarRef !== "string" || !calendarRef || ownerRef !== user.userRef || primary !== true) return failure("FLEX_READ_FAILED");
  const endExclusive = shiftDate(range.to, 1);
  const period = { calendarRef, start: range.from, endExclusive };
  const [regular, recurring] = await Promise.all([
    readFlexJson(context, { kind: "calendarEvents", ...period }, signal),
    readFlexJson(context, { kind: "recurringCalendarEvents", ...period }, signal),
  ]);
  if (!regular.ok) return regular;
  if (!recurring.ok) return recurring;
  if (regular.value.complete !== true || recurring.value.complete !== true
    || !Array.isArray(regular.value.events) || !Array.isArray(recurring.value.events)) return failure("FLEX_READ_FAILED");
  const events = selectEvents([...regular.value.events, ...recurring.value.events], calendarRef, range, endExclusive);
  return events ? success({ ...range, timezone, events }) : failure("FLEX_READ_FAILED");
}
