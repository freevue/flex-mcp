export const timezone = "Asia/Seoul";
export type DateRange = { from: string; to: string };
export type FlexQuery = { kind: "leave" } | { kind: "schedule" | "work"; range: DateRange };
export type Outcome<Value, Failure> = { ok: true; value: Value } | { ok: false; error: Failure };

export function success<Value>(value: Value): Outcome<Value, never> {
  return { ok: true, value };
}

export function failure<Failure>(error: Failure): Outcome<never, Failure> {
  return { ok: false, error };
}

export type LeaveBalance = {
  days: number;
  totalMinutes: number;
  breakdown: { days: number; hours: number; minutes: number };
};
export type AnnualLeaveResult = { asOf: string; remaining: LeaveBalance; usable: LeaveBalance };
export type ScheduleEvent = {
  title: string;
  type: string;
  status: string;
  allDay: boolean;
  startAt: string;
  endAtExclusive: string;
};
type RangedResult = DateRange & { timezone: typeof timezone };
export type ScheduleResult = RangedResult & { events: ScheduleEvent[] };
export const workFields = [
  "actualMinutes", "recognizedMinutes", "requiredAgreedMinutes", "overtimeMinutes", "timeOffMinutes",
] as const;
export type WorkTotals = Record<typeof workFields[number], number>;
export type WorkHoursResult = RangedResult & WorkTotals;
export type FlexResult = AnnualLeaveResult | ScheduleResult | WorkHoursResult;
export type FlexRequestFailure = "FLEX_REAUTH_REQUIRED" | "FLEX_READ_FAILED";
export type FlexReadFailure = FlexRequestFailure | "FLEX_NO_RECORDS";
export type BrowserQueryFailure = FlexReadFailure | "FLEX_TAB_UNAVAILABLE" | "FLEX_ACCOUNT_MISMATCH";
export const bridgeErrors = [
  "BROWSER_OFFLINE", "FLEX_TAB_UNAVAILABLE", "FLEX_REAUTH_REQUIRED", "FLEX_ACCOUNT_MISMATCH",
  "FLEX_NO_RECORDS", "FLEX_READ_FAILED", "QUERY_TIMEOUT", "INVALID_BRIDGE_MESSAGE",
] as const;
export type BridgeError = typeof bridgeErrors[number];
export type BridgeRequest = { requestId: string; query: FlexQuery };
export type BridgeReply = { requestId: string } & ({ result: FlexResult } | { error: BridgeError });

export type BridgeRegistration = { bindingId: string; deviceKey: string };

export type DevicePairingStart = { approvalCode: string; requestKey: string; expiresAt: number };
export type DevicePairingClaim =
  | { status: "pending" | "unavailable" }
  | { status: "registered"; registration: BridgeRegistration };
