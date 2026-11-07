import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateRestTargetMinutes, calculateWorkSummary, getWorkSummaryRanges, readDemoWorkSummary } from "../src/flex/index.ts";
import { formatWorkMinutes, readPopupSnapshot } from "../src/popup/index.ts";

const input = {
  todayActualMinutes: 320,
  monthActualMinutes: 5_520,
  monthRecognizedMinutes: 5_400,
  monthAnnualLeaveUsedMinutes: 0,
  monthAnnualLeaveRecognizedMinutes: 0,
  monthAnnualLeaveScheduledMinutes: 0,
  monthAnnualLeaveScheduledRecognizedMinutes: 0,
  monthRequiredMinutes: 9_600,
  restTargetMinutes: 960
};

test("월 목표에서 실제 근무 대신 인정 근무를 빼고 휴무 차감은 한 번 적용한다", () => {
  assert.deepEqual(calculateWorkSummary(input), {
    todayActualMinutes: 320,
    monthActualMinutes: 5_520,
    monthRecognizedMinutes: 5_400,
    monthAnnualLeaveUsedMinutes: 0,
    monthAnnualLeaveRecognizedMinutes: 0,
    monthAnnualLeaveScheduledMinutes: 0,
    monthAnnualLeaveScheduledRecognizedMinutes: 0,
    monthRecognizedWithoutAnnualLeaveMinutes: 5_400,
    standardRemainingMinutes: 4_200,
    adjustedRemainingMinutes: 3_240,
    projectedStandardRemainingMinutes: 4_200,
    projectedAdjustedRemainingMinutes: 3_240
  });
  assert.equal(calculateWorkSummary({ ...input, restTargetMinutes: 0 }).adjustedRemainingMinutes, 4_200);
  assert.equal(calculateWorkSummary({ ...input, restTargetMinutes: null }).adjustedRemainingMinutes, null);
  assert.equal(calculateWorkSummary({ ...input, monthRequiredMinutes: null }).standardRemainingMinutes, null);
  assert.equal(calculateWorkSummary({ ...input, monthRecognizedMinutes: 9_800 }).standardRemainingMinutes, 0);
});

test("UT-formatWorkMinutes-01~03: 시간과 분, 0분과 계산 정보 없음을 구분한다", () => {
  assert.equal(formatWorkMinutes(320), "5시간 20분");
  assert.equal(formatWorkMinutes(0), "0시간");
  assert.equal(formatWorkMinutes(null), "계산 정보 없음");
});

test("예정 연차 인정분은 예상 남은 시간에만 한 번 반영한다", () => {
  const summary = calculateWorkSummary({
    ...input,
    monthAnnualLeaveUsedMinutes: 480,
    monthAnnualLeaveRecognizedMinutes: 360,
    monthAnnualLeaveScheduledMinutes: 240,
    monthAnnualLeaveScheduledRecognizedMinutes: 180
  });
  assert.equal(summary.monthRecognizedWithoutAnnualLeaveMinutes, 5_040);
  assert.equal(summary.monthAnnualLeaveUsedMinutes, 480);
  assert.equal(summary.monthAnnualLeaveScheduledMinutes, 240);
  assert.equal(summary.standardRemainingMinutes, 4_200);
  assert.equal(summary.adjustedRemainingMinutes, 3_240);
  assert.equal(summary.projectedStandardRemainingMinutes, 4_020);
  assert.equal(summary.projectedAdjustedRemainingMinutes, 3_060);
  assert.equal(calculateWorkSummary({ ...input, monthAnnualLeaveRecognizedMinutes: null }).monthRecognizedWithoutAnnualLeaveMinutes, null);
  assert.equal(calculateWorkSummary({ ...input, monthAnnualLeaveRecognizedMinutes: 5_401 }).monthAnnualLeaveRecognizedMinutes, null);
});

test("예상치의 차감 근거가 없으면 비우고 남은 시간을 음수로 표시하지 않는다", () => {
  const unverified = calculateWorkSummary({
    ...input,
    monthAnnualLeaveScheduledMinutes: 480,
    monthAnnualLeaveScheduledRecognizedMinutes: null
  });
  assert.equal(unverified.standardRemainingMinutes, 4_200);
  assert.equal(unverified.projectedStandardRemainingMinutes, null);
  assert.equal(unverified.projectedAdjustedRemainingMinutes, null);
  const enough = {
    ...input,
    monthRecognizedMinutes: 9_540,
    monthAnnualLeaveScheduledMinutes: 480,
    monthAnnualLeaveScheduledRecognizedMinutes: 480
  };
  assert.equal(calculateWorkSummary(enough).projectedStandardRemainingMinutes, 0);
  assert.equal(calculateWorkSummary({ ...enough, restTargetMinutes: null }).projectedAdjustedRemainingMinutes, null);
  assert.equal(calculateWorkSummary({ ...enough, monthAnnualLeaveScheduledRecognizedMinutes: 481 }).projectedStandardRemainingMinutes, null);
});

test("한국 자정으로 기간을 나누고 합성 자료로 월 요약을 계산한다", async () => {
  assert.deepEqual(getWorkSummaryRanges(new Date("2028-01-31T15:00:00Z")), {
    today: { from: "2028-02-01", to: "2028-02-01" },
    monthToDate: { from: "2028-02-01", to: "2028-02-01" },
    fullMonth: { from: "2028-02-01", to: "2028-02-29" }
  });
  const summary = await readDemoWorkSummary("0b47a3c6-cddf-43b8-85f9-fdc8ef531661", new AbortController().signal, new Date("2026-11-18T00:00:00Z"));
  assert.deepEqual(summary, calculateWorkSummary(input));
  const snapshot = { kind: "connected", flex: "synthetic", summary, approvalCode: "ABCD-1234-5678", inviteFailed: false };
  assert.deepEqual(readPopupSnapshot(snapshot), snapshot);
  assert.equal(readPopupSnapshot({ ...snapshot, summary: { ...summary, account: "example" } }), null);
  assert.equal(readPopupSnapshot({ ...snapshot, summary: { ...summary, monthRecognizedMinutes: -1 } }), null);
  assert.equal(readPopupSnapshot({ ...snapshot, requestKey: "private" }), null);
  assert.equal(readPopupSnapshot({ ...snapshot, flex: "unavailable" }), null);
  const unavailable = { ...snapshot, flex: "unavailable", summary: null };
  assert.equal(readPopupSnapshot(unavailable), null);
  assert.deepEqual(readPopupSnapshot({ ...unavailable, approvalCode: null }), { ...unavailable, approvalCode: null });
  assert.equal(readPopupSnapshot({ kind: "disconnected", canReconnect: false, approvalCode: null, requestKey: "private" }), null);
});

test("휴무 요일에 포함된 날짜의 기본 목표만 합친다", () => {
  const range = { from: "2026-11-01", to: "2026-11-14" };
  const targets = { "2026-11-04": 480, "2026-11-11": 0, "2026-11-05": 120 };
  assert.equal(calculateRestTargetMinutes(range, [3], targets), 480);
  assert.equal(calculateRestTargetMinutes(range, [3], { ...targets, "2026-11-11": null }), null);
  assert.equal(calculateRestTargetMinutes(range, [], {}), 0);
});
