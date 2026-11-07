import assert from "node:assert/strict";
import type { Page } from "playwright";
import type { WorkSummaryResult } from "../../../shared/index.ts";

const sample: WorkSummaryResult = {
  todayActualMinutes: 320,
  monthActualMinutes: 5_040,
  monthRecognizedMinutes: 5_400,
  monthRecognizedWithoutAnnualLeaveMinutes: 5_040,
  monthAnnualLeaveUsedMinutes: 480,
  monthAnnualLeaveRecognizedMinutes: 360,
  monthAnnualLeaveScheduledMinutes: 480,
  monthAnnualLeaveScheduledRecognizedMinutes: 360,
  standardRemainingMinutes: 4_200,
  adjustedRemainingMinutes: 3_240,
  projectedStandardRemainingMinutes: 3_840,
  projectedAdjustedRemainingMinutes: 2_880
};

export async function checkDashboardFixtures(popup: Page, popupUrl: string): Promise<void> {
  await popup.addInitScript((summary) => {
    const { chrome } = globalThis as typeof globalThis & {
      chrome: { runtime: { sendMessage: () => Promise<unknown> } };
    };
    chrome.runtime.sendMessage = async () => {
      const mode = window.location.hash;
      if (mode === "#error") return { kind: "error" };
      const missing = mode === "#missing";
      const unavailable = mode === "#unavailable";
      const values = missing
        ? { ...summary, monthAnnualLeaveScheduledRecognizedMinutes: null, projectedStandardRemainingMinutes: null, projectedAdjustedRemainingMinutes: null }
        : summary;
      return {
        kind: "connected",
        flex: unavailable ? "unavailable" : "synthetic",
        summary: unavailable ? null : values,
        approvalCode: null,
        inviteFailed: false
      };
    };
  }, sample);

  await popup.goto(`${popupUrl}?fixture=projected`);
  await popup.getByText("예시 근무 데이터", { exact: true }).waitFor();
  assert.deepEqual(await popup.locator(".work-month dd").allTextContents(), ["96시간", "90시간"], "FT-GALPI-DASHBOARD-01");
  assert.deepEqual(await popup.locator(".work-remaining dd").allTextContents(), ["64시간", "48시간"], "UT-renderWorkSummary-01");
  const remainingBackground = await popup
    .locator(".work-remaining dl > div")
    .evaluateAll((items) => items.map((item) => getComputedStyle(item).backgroundColor));
  assert.deepEqual(remainingBackground, ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)"]);

  await popup.goto(`${popupUrl}?fixture=missing#missing`);
  await popup.getByText("계산 정보 없음", { exact: true }).first().waitFor();
  assert.deepEqual(await popup.locator(".work-month dd").allTextContents(), ["계산 정보 없음", "90시간"], "UT-renderWorkSummary-02");
  assert.deepEqual(await popup.locator(".work-remaining dd").allTextContents(), ["계산 정보 없음", "계산 정보 없음"]);

  await popup.goto(`${popupUrl}?fixture=unavailable#unavailable`);
  const retry = popup.getByRole("button", { name: "다시 확인" });
  await retry.waitFor();
  assert.deepEqual(await popup.locator(".connection-rows dd").allTextContents(), ["연결됨", "미연결"], "UT-renderConnectionRows-02");
  assert.equal(await retry.getAttribute("data-action"), "popup-state", "UT-popupButton-01");
  assert.equal(await popup.getByRole("heading", { name: "오늘 실제 근무" }).count(), 0, "FT-GALPI-DASHBOARD-02");
  assert.equal(await popup.getByRole("button", { name: "코드 확인" }).isVisible(), false);

  await popup.goto(`${popupUrl}?fixture=error#error`);
  await popup.getByRole("heading", { name: "연결 확인 실패" }).waitFor();
  assert.equal(await retry.isVisible(), true, "UT-renderUnavailablePopup-01");
}
