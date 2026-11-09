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
    let refreshes = 0;
    chrome.runtime.sendMessage = async () => {
      const mode = window.location.hash;
      if (mode === "#error") return { kind: "error" };
      if (mode === "#counting-work") {
        const current = refreshes++;
        return {
          kind: "connected",
          flex: "live",
          summary: { ...summary, todayActualMinutes: Math.min(10 + current, 11) },
          workStatus: current < 2 ? "working" : "on_break",
          approvalCode: null,
          inviteFailed: false
        };
      }
      const missing = mode === "#missing";
      const unavailable = mode === "#unavailable";
      const values =
        mode === "#missing-today"
          ? { ...summary, todayActualMinutes: null }
          : missing
            ? { ...summary, monthAnnualLeaveScheduledRecognizedMinutes: null, projectedStandardRemainingMinutes: null, projectedAdjustedRemainingMinutes: null }
            : summary;
      return {
        kind: "connected",
        flex: unavailable ? "unavailable" : "synthetic",
        summary: unavailable ? null : values,
        workStatus: mode === "#bad-status" ? "wrong" : mode.slice(1) || "working",
        approvalCode: null,
        inviteFailed: false
      };
    };
  }, sample);

  await popup.goto(`${popupUrl}?fixture=projected`);
  await popup.getByText("예시 근무 데이터", { exact: true }).waitFor();
  assert.deepEqual(await popup.locator(".work-month dd").allTextContents(), ["96시간", "90시간"], "FT-GALPI-DASHBOARD-01");
  const remaining = popup.locator(".work-remaining");
  assert.deepEqual(await remaining.locator("dt").allTextContents(), ["놀수 반영", "놀수 미반영"]);
  assert.deepEqual(await remaining.locator("dd").allTextContents(), ["48시간", "64시간"], "UT-renderWorkSummary-01");
  const remainingBackground = await popup
    .locator(".work-remaining dl > div")
    .evaluateAll((items) => items.map((item) => getComputedStyle(item).backgroundColor));
  assert.deepEqual(remainingBackground, ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)"]);

  await popup.goto(`${popupUrl}?fixture=missing#missing`);
  await popup.getByText("계산 정보 없음", { exact: true }).first().waitFor();
  assert.deepEqual(await popup.locator(".work-month dd").allTextContents(), ["계산 정보 없음", "90시간"], "UT-renderWorkSummary-02");
  assert.deepEqual(await popup.locator(".work-remaining dd").allTextContents(), ["계산 정보 없음", "계산 정보 없음"]);

  for (const [state, label] of Object.entries({
    working: "근무 중",
    on_break: "휴게 중",
    idle: "기록 중 아님",
    unknown: "확인 불가",
    "bad-status": "확인 불가"
  })) {
    await popup.goto(`${popupUrl}?fixture=status-${state}#${state}`);
    const status = popup.locator(".work-today .work-status");
    await status.waitFor();
    assert.equal(await status.textContent(), label, "UT-renderWorkSummary-03");
    assert.equal(await popup.locator(".work-today strong").textContent(), "5시간 20분", "FT-GALPI-DASHBOARD-05");
    const fits = await status.evaluate((badge) => {
      document.documentElement.style.fontSize = "22px";
      const card = badge.closest(".work-today");
      return Boolean(card && card.scrollWidth === card.clientWidth && badge.getBoundingClientRect().right <= card.getBoundingClientRect().right);
    });
    assert.equal(fits, true, "FT-GALPI-DASHBOARD-05");
  }

  await popup.goto(`${popupUrl}?fixture=missing-today#missing-today`);
  await popup.getByText("계산 정보 없음", { exact: true }).waitFor();
  assert.equal(await popup.locator(".work-today strong").textContent(), "계산 정보 없음", "FT-GALPI-ACTIVE-WORK-02");
  assert.deepEqual(await popup.locator(".work-month dd").allTextContents(), ["96시간", "90시간"]);

  await popup.goto(`${popupUrl}?fixture=unavailable#unavailable`);
  const retry = popup.getByRole("button", { name: "다시 확인" });
  await retry.waitFor();
  assert.deepEqual(await popup.locator(".connection-rows dd").allTextContents(), ["연결됨", "미연결"], "UT-renderConnectionRows-02");
  assert.equal(await retry.getAttribute("data-action"), "popup-state", "UT-popupButton-01");
  assert.equal(await popup.getByRole("heading", { name: "오늘 실제 근무" }).count(), 0, "FT-GALPI-DASHBOARD-02");
  assert.equal(await popup.getByRole("button", { name: "코드 확인" }).isVisible(), false);
  assert.equal(await popup.locator(".work-status").count(), 0, "FT-GALPI-DASHBOARD-02");

  await popup.goto(`${popupUrl}?fixture=error#error`);
  await popup.getByRole("heading", { name: "연결 확인 실패" }).waitFor();
  assert.equal(await retry.isVisible(), true, "UT-renderUnavailablePopup-01");

  await popup.clock.install();
  await popup.goto(`${popupUrl}?fixture=counting-work#counting-work`);
  await popup.getByText("0시간 10분", { exact: true }).waitFor();
  await popup.clock.runFor(15_000);
  await popup.getByText("0시간 11분", { exact: true }).waitFor();
  await popup.clock.runFor(15_000);
  await popup.getByText("휴게 중", { exact: true }).waitFor();
  assert.equal(await popup.locator(".work-today strong").textContent(), "0시간 11분", "FT-GALPI-ACTIVE-WORK-01");
}
