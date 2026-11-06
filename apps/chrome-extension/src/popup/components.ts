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
    textElement("p", "기존 에이전트 대화에 이 코드를 보내고 연결 승인을 요청하세요."),
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
      : { label: "Flex 연결", value: "미연결", tone: "attention" },
  ];
  for (const { label, value, tone } of entries) {
    const row = document.createElement("div");
    row.append(textElement("dt", label), textElement("dd", value, `signal ${tone}`));
    list.append(row);
  }
  return list;
}

export function renderWorkSummary(summary: PopupWorkSummary): HTMLElement {
  const panel = document.createElement("section");
  panel.className = "work";
  const list = document.createElement("dl");
  const entries = [
    { label: "오늘 근무", minutes: summary.todayActualMinutes },
    { label: "이번 달 누적", minutes: summary.monthActualMinutes },
    { label: "남은 시간 · 휴무 미반영", minutes: summary.standardRemainingMinutes },
    { label: "남은 시간 · 휴무 반영", minutes: summary.adjustedRemainingMinutes },
  ];
  for (const { label, minutes } of entries) {
    const item = document.createElement("div");
    item.append(textElement("dt", label), textElement("dd", formatWorkMinutes(minutes)));
    list.append(item);
  }
  panel.append(
    textElement("h2", "근무 요약"),
    textElement("p", "이번 달 · 합성 데이터", "metadata"),
    list,
  );
  return panel;
}
