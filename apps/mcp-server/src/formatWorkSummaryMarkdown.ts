import { isWorkSummary } from "../../../shared/index.ts";

function formatMinutes(minutes: number | null): string {
  if (minutes === null) return "계산 정보 없음";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}시간 ${remainder}분` : `${hours}시간`;
}

/** 근무 요약을 화면 표시용으로 바꿉니다. @see wiki/unit/mcp/formatWorkSummaryMarkdown.md */
export function formatWorkSummaryMarkdown(result: Record<string, unknown>): string | undefined {
  const { synthetic, ...summary } = result;
  if ((synthetic !== undefined && synthetic !== true) || !isWorkSummary(summary)) return undefined;

  const recognized = summary.monthRecognizedMinutes;
  const scheduled = summary.monthAnnualLeaveScheduledRecognizedMinutes;
  const including = scheduled === null ? null : recognized + scheduled;
  const lines = [
    "### 오늘 실제 근무",
    formatMinutes(summary.todayActualMinutes),
    "",
    "### 이번 달 인정 근무",
    `- 연차 포함: ${formatMinutes(Number.isSafeInteger(including) ? including : null)}`,
    `- 연차 미포함: ${formatMinutes(recognized)}`,
    "",
    "### 이번 달 남은 시간",
    `- 놀수 미반영: ${formatMinutes(summary.projectedStandardRemainingMinutes)}`,
    `- 놀수 반영: ${formatMinutes(summary.projectedAdjustedRemainingMinutes)}`
  ];
  return (synthetic ? ["예시 근무 데이터", "", ...lines] : lines).join("\n");
}
