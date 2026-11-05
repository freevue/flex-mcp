import { failure, isLeaveBalance, isRecord, success } from "../../../../shared/index.ts";
import type { AnnualLeaveResult, Outcome } from "../../../../shared/index.ts";

function readBalance(value: unknown) {
  if (!isRecord(value) || !isRecord(value.breakdown)) return null;
  const { days, totalMinutes, breakdown } = value;
  const balance = { days, totalMinutes, breakdown: { days: breakdown.days, hours: breakdown.hours, minutes: breakdown.minutes } };
  return isLeaveBalance(balance) ? balance : null;
}

export function parseAnnualLeave(raw: unknown, asOf: Date):
  Outcome<AnnualLeaveResult, "FLEX_NO_RECORDS" | "FLEX_READ_FAILED"> {
  if (!isRecord(raw) || !Number.isFinite(asOf.valueOf())) return failure("FLEX_READ_FAILED");
  if (raw.kind === "no-records") return failure("FLEX_NO_RECORDS");
  const remaining = readBalance(raw.remaining);
  const usable = readBalance(raw.usable);
  return remaining && usable ? success({ asOf: asOf.toISOString(), remaining, usable }) : failure("FLEX_READ_FAILED");
}
