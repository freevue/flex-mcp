import type { PopupWorkSummary } from "../flex/workSummary.ts";
import { formatWorkMinutes } from "./formatWorkMinutes.ts";
import type { PopupCommand, PopupSnapshot } from "./types.ts";

export function popupButton(label: string, action: PopupCommand | "copy", secondary = false): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.dataset.action = action;
  if (secondary) button.className = "secondary";
  return button;
}

function textElement<Tag extends keyof HTMLElementTagNameMap>(tag: Tag, text: string, className?: string) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

export function renderApprovalCode(code: string): HTMLElement {
  const panel = document.createElement("section");
  panel.className = "approval";
  panel.append(
    textElement("h2", "승인 대기"),
    textElement("code", code, "approval-code"),
    textElement("p", "MCP 클라이언트 대화에 이 코드를 보내고 연결 승인을 요청하세요."),
    popupButton("코드 복사", "copy", true),
  );
  return panel;
}

export function renderConnectionRows(flex: Extract<PopupSnapshot, { kind: "connected" }>["flex"]): HTMLDListElement {
  const list = document.createElement("dl");
  list.className = "connection-rows";
  const entries = [
    { label: "MCP 연결", value: "연결됨", tone: "online" },
    flex === "synthetic" ? { label: "Flex 연결", value: "합성 모드", tone: "attention" }
      : flex === "live" ? { label: "Flex 연결", value: "연결됨", tone: "online" }
        : { label: "Flex 연결", value: "미연결", tone: "attention" },
  ];
  for (const { label, value, tone } of entries) {
    const row = document.createElement("div");
    row.append(textElement("dt", label), textElement("dd", value, `signal ${tone}`));
    list.append(row);
  }
  return list;
}

function renderRemainingHours(summary: PopupWorkSummary): HTMLTableElement {
  const table = document.createElement("table");
  table.className = "work-remaining";
  const columns = table.createTHead().insertRow();
  for (const label of ["남은 시간", "놀수 미반영", "놀수 반영"]) {
    const heading = textElement("th", label);
    heading.scope = "col";
    columns.append(heading);
  }
  const body = table.createTBody();
  const rows = [
    { label: "오늘 기준", standard: summary.standardRemainingMinutes, adjusted: summary.adjustedRemainingMinutes },
    { label: "예정 연차 반영", standard: summary.projectedStandardRemainingMinutes, adjusted: summary.projectedAdjustedRemainingMinutes },
  ];
  for (const { label, standard, adjusted } of rows) {
    const heading = textElement("th", label);
    heading.scope = "row";
    body.insertRow().append(heading, textElement("td", formatWorkMinutes(standard)), textElement("td", formatWorkMinutes(adjusted)));
  }
  return table;
}

export function renderWorkSummary(summary: PopupWorkSummary, source: "synthetic" | "live"): HTMLElement {
  const panel = document.createElement("section");
  panel.className = "work";
  const list = document.createElement("dl");
  const entries = [
    { label: "오늘 근무", minutes: summary.todayActualMinutes },
    { label: "이번 달 누적", minutes: summary.monthActualMinutes },
    { label: "이번 달 인정 합계", minutes: summary.monthRecognizedMinutes },
    { label: "연차 제외 인정", minutes: summary.monthRecognizedWithoutAnnualLeaveMinutes },
    { label: "사용 연차", minutes: summary.monthAnnualLeaveUsedMinutes, credit: summary.monthAnnualLeaveRecognizedMinutes },
    { label: "예정 연차", minutes: summary.monthAnnualLeaveScheduledMinutes, credit: summary.monthAnnualLeaveScheduledRecognizedMinutes },
  ];
  for (const { label, minutes, credit } of entries) {
    const item = document.createElement("div");
    const value = textElement("dd", formatWorkMinutes(minutes));
    if (credit !== undefined && minutes !== null) {
      value.append(textElement("span", credit === null ? "인정 시간 미확인" : `${formatWorkMinutes(credit)} 인정`, "work-credit"));
    }
    item.append(textElement("dt", label), value);
    list.append(item);
  }
  panel.append(
    textElement("h2", "근무 요약"),
    textElement("p", source === "synthetic" ? "이번 달 · 예시" : "이번 달 · Flex 기준", "metadata"),
    list,
    renderRemainingHours(summary),
  );
  return panel;
}
