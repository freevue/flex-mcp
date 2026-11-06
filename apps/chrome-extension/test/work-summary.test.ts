import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateRestTargetMinutes, calculateWorkSummary, getWorkSummaryRanges, readDemoWorkSummary } from "../src/flex/index.ts";
import { formatWorkMinutes, readPopupSnapshot } from "../src/popup/index.ts";

const input = {
  todayActualMinutes: 320,
  monthActualMinutes: 5_520,
  monthRecognizedMinutes: 5_400,
  monthRequiredMinutes: 9_600,
  restTargetMinutes: 960,
};

test("월 목표에서 실제 근무 대신 인정 근무를 빼고 휴무 차감은 한 번 적용한다", () => {
  assert.deepEqual(calculateWorkSummary(input), {
    todayActualMinutes: 320, monthActualMinutes: 5_520, standardRemainingMinutes: 4_200, adjustedRemainingMinutes: 3_240,
  });
  assert.equal(calculateWorkSummary({ ...input, restTargetMinutes: 0 }).adjustedRemainingMinutes, 4_200);
  assert.equal(calculateWorkSummary({ ...input, restTargetMinutes: null }).adjustedRemainingMinutes, null);
  assert.equal(calculateWorkSummary({ ...input, monthRequiredMinutes: null }).standardRemainingMinutes, null);
  assert.equal(calculateWorkSummary({ ...input, monthRecognizedMinutes: 9_800 }).standardRemainingMinutes, 0);
  assert.equal(formatWorkMinutes(320), "5시간 20분");
  assert.equal(formatWorkMinutes(null), "계산 정보 없음");
});

test("한국 자정으로 기간을 나누고 합성 자료로 월 요약을 계산한다", async () => {
  assert.deepEqual(getWorkSummaryRanges(new Date("2028-01-31T15:00:00Z")), {
    today: { from: "2028-02-01", to: "2028-02-01" },
    monthToDate: { from: "2028-02-01", to: "2028-02-01" },
    fullMonth: { from: "2028-02-01", to: "2028-02-29" },
  });
  const summary = await readDemoWorkSummary(
    "0b47a3c6-cddf-43b8-85f9-fdc8ef531661", new AbortController().signal, new Date("2026-11-18T00:00:00Z"),
  );
  assert.deepEqual(summary, calculateWorkSummary(input));
  assert.deepEqual(readPopupSnapshot({ kind: "connected", flex: "synthetic", summary }), {
    kind: "connected", flex: "synthetic", summary,
  });
  assert.equal(readPopupSnapshot({ kind: "connected", flex: "unavailable", summary }), null);
  assert.equal(readPopupSnapshot({ kind: "disconnected", canReconnect: false, approvalCode: null, requestKey: "private" }), null);
});

test("휴무 요일에 포함된 날짜의 기본 목표만 합친다", () => {
  const range = { from: "2026-11-01", to: "2026-11-14" };
  const targets = { "2026-11-04": 480, "2026-11-11": 0, "2026-11-05": 120 };
  assert.equal(calculateRestTargetMinutes(range, [3], targets), 480);
  assert.equal(calculateRestTargetMinutes(range, [3], { ...targets, "2026-11-11": null }), null);
  assert.equal(calculateRestTargetMinutes(range, [], {}), 0);
});
