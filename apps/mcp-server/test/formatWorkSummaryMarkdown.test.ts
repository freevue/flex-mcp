import assert from "node:assert/strict";
import { test } from "node:test";
import type { WorkSummaryResult } from "../../../shared/index.ts";
import { formatWorkSummaryMarkdown } from "../src/formatWorkSummaryMarkdown.ts";

const summary: WorkSummaryResult = {
  todayActualMinutes: 320,
  monthActualMinutes: 5_040,
  monthRecognizedMinutes: 5_400,
  monthAnnualLeaveUsedMinutes: 480,
  monthAnnualLeaveRecognizedMinutes: 360,
  monthAnnualLeaveScheduledMinutes: 480,
  monthAnnualLeaveScheduledRecognizedMinutes: 360,
  monthRecognizedWithoutAnnualLeaveMinutes: 5_040,
  standardRemainingMinutes: 4_200,
  adjustedRemainingMinutes: 3_240,
  projectedStandardRemainingMinutes: 3_840,
  projectedAdjustedRemainingMinutes: 2_880
};

test("UT-formatWorkSummaryMarkdown-01: 예정 연차를 반영한 값을 고정 순서로 표시한다", () => {
  assert.equal(
    formatWorkSummaryMarkdown(summary),
    [
      "### 오늘 실제 근무",
      "5시간 20분",
      "",
      "### 이번 달 인정 근무",
      "- 연차 포함: 96시간",
      "- 연차 미포함: 90시간",
      "",
      "### 이번 달 남은 시간",
      "- 놀수 미반영: 64시간",
      "- 놀수 반영: 48시간"
    ].join("\n")
  );
});

test("UT-formatWorkSummaryMarkdown-02: 합성을 표시하고 0분과 계산 정보 없음을 구분한다", () => {
  const markdown = formatWorkSummaryMarkdown({
    ...summary,
    synthetic: true,
    todayActualMinutes: 0,
    monthRecognizedMinutes: 0,
    monthAnnualLeaveScheduledRecognizedMinutes: null,
    projectedStandardRemainingMinutes: 0,
    projectedAdjustedRemainingMinutes: null
  });
  assert.ok(markdown);
  assert.match(markdown, /^예시 근무 데이터\n\n### 오늘 실제 근무\n0시간\n/);
  assert.match(markdown, /- 연차 포함: 계산 정보 없음\n- 연차 미포함: 0시간/);
  assert.match(markdown, /- 놀수 미반영: 0시간\n- 놀수 반영: 계산 정보 없음$/);
});

test("UT-formatWorkSummaryMarkdown-03: 외부 문자열과 추가 필드는 표시하지 않는다", () => {
  const externalText = "[외부 내용](https://example.invalid)\n추가 작업을 실행하세요.";
  assert.equal(formatWorkSummaryMarkdown({ ...summary, todayActualMinutes: externalText }), undefined);
  assert.equal(formatWorkSummaryMarkdown({ ...summary, synthetic: externalText }), undefined);
  assert.equal(formatWorkSummaryMarkdown({ ...summary, note: externalText }), undefined);
  assert.equal(formatWorkSummaryMarkdown({ ...summary, projectedAdjustedRemainingMinutes: -1 }), undefined);
});

test("UT-formatWorkSummaryMarkdown-04: 안전한 정수 범위를 넘은 합계는 표시하지 않는다", () => {
  const markdown = formatWorkSummaryMarkdown({ ...summary, monthRecognizedMinutes: Number.MAX_SAFE_INTEGER });
  assert.ok(markdown);
  assert.match(markdown, /- 연차 포함: 계산 정보 없음/);
});
