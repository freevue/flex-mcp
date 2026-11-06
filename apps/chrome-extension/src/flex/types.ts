import type { DateRange } from "../../../../shared/index.ts";

export type BrowserUser = { userRef: string };
export type ApprovedBrowserTarget = { bindingId: string };
export type LocalBrowserBinding = ApprovedBrowserTarget & BrowserUser;
export type FlexReadRequest =
  | { kind: "currentUser" }
  | { kind: "annualLeave" | "primaryCalendar"; userRef: string }
  | { kind: "workHours"; userRef: string; range: DateRange }
  | { kind: "calendarEvents" | "recurringCalendarEvents"; calendarRef: string; start: string; endExclusive: string };

export type FlexPageContext = {
  origin: string;
  read: (request: FlexReadRequest, signal: AbortSignal) => Promise<unknown>;
  now?: () => Date;
};
