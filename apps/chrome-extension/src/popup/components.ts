import type { PopupWorkSummary } from "../flex/workSummary.ts";
import { formatWorkMinutes } from "./formatWorkMinutes.ts";
import type { PopupCommand, PopupSnapshot } from "./types.ts";

/** 팝업 동작 버튼을 만듭니다. @see wiki/unit/popup/popupButton.md */
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

/** 승인 대기 화면을 만듭니다. @see wiki/unit/popup/renderApprovalCode.md */
export function renderApprovalCode(code: string): HTMLElement {
  const panel = document.createElement("section");
  panel.className = "approval";
  panel.append(
    textElement("h2", "승인 대기"),
    textElement("code", code, "approval-code"),
    textElement("p", "MCP 클라이언트 대화에 이 코드를 보내고 연결 승인을 요청하세요."),
    popupButton("코드 복사", "copy", true)
  );
  return panel;
}

/** MCP에 연결되지 않은 팝업을 만듭니다. @see wiki/unit/popup/renderUnavailablePopup.md */
export function renderUnavailablePopup(snapshot: Exclude<PopupSnapshot, { kind: "connected" }>): HTMLElement[] {
  if (snapshot.kind === "error") {
    return [textElement("h1", "연결 확인 실패", "error"), textElement("p", "팝업 상태를 읽지 못했습니다."), popupButton("다시 확인", "popup-open")];
  }
  const { approvalCode, canReconnect, needsFlex } = snapshot;
  if (!canReconnect && approvalCode) return [renderApprovalCode(approvalCode)];
  const nodes: HTMLElement[] = [textElement("h1", "Chrome 연결"), textElement("p", "MCP 소켓이 연결되어 있지 않습니다.")];
  if (needsFlex && !approvalCode) nodes.push(textElement("p", "같은 Chrome 프로필에서 Flex에 로그인한 뒤 코드를 발급하세요."));
  nodes.push(approvalCode ? renderApprovalCode(approvalCode) : popupButton("일회용 코드 발급", "popup-issue-code"));
  if (canReconnect) nodes.push(popupButton("다시 연결", "popup-reconnect", true));
  return nodes;
}

/** MCP와 Flex 상태를 표시합니다. @see wiki/unit/popup/renderConnectionRows.md */
export function renderConnectionRows(flex: Extract<PopupSnapshot, { kind: "connected" }>["flex"]): HTMLDListElement {
  const list = document.createElement("dl");
  list.className = "connection-rows";
  list.setAttribute("aria-label", "연결 상태");
  const entries = [
    { label: "MCP", value: "연결됨", tone: "online" },
    flex === "synthetic"
      ? { label: "Flex", value: "합성 모드", tone: "attention" }
      : flex === "live"
        ? { label: "Flex", value: "연결됨", tone: "online" }
        : { label: "Flex", value: "미연결", tone: "attention" }
  ];
  for (const { label, value, tone } of entries) {
    const row = document.createElement("div");
    row.append(textElement("dt", label), textElement("dd", value, `signal ${tone}`));
    list.append(row);
  }
  return list;
}

function renderMinutePairs(entries: readonly { label: string; minutes: number | null }[]): HTMLDListElement {
  const list = document.createElement("dl");
  for (const { label, minutes } of entries) {
    const item = document.createElement("div");
    item.append(textElement("dt", label), textElement("dd", formatWorkMinutes(minutes)));
    list.append(item);
  }
  return list;
}

/** 오늘 근무와 월 근무 요약을 표시합니다. @see wiki/unit/popup/renderWorkSummary.md */
export function renderWorkSummary(summary: PopupWorkSummary, source: "synthetic" | "live"): HTMLElement {
  const panel = document.createElement("section");
  panel.className = "work";
  const today = document.createElement("section");
  today.className = "work-today";
  today.append(textElement("h2", "오늘 실제 근무"), textElement("strong", formatWorkMinutes(summary.todayActualMinutes)));
  if (source === "synthetic") today.append(textElement("p", "예시 근무 데이터", "metadata"));

  const month = document.createElement("section");
  month.className = "work-month";
  const { monthRecognizedMinutes, monthAnnualLeaveScheduledRecognizedMinutes: scheduled } = summary;
  month.append(
    textElement("h2", "이번 달 인정 근무"),
    renderMinutePairs([
      { label: "연차 포함", minutes: scheduled === null ? null : monthRecognizedMinutes + scheduled },
      { label: "연차 미포함", minutes: monthRecognizedMinutes }
    ])
  );

  const remaining = document.createElement("section");
  remaining.className = "work-remaining";
  remaining.append(
    textElement("h2", "이번 달 남은 시간"),
    renderMinutePairs([
      { label: "놀수 미반영", minutes: summary.projectedStandardRemainingMinutes },
      { label: "놀수 반영", minutes: summary.projectedAdjustedRemainingMinutes }
    ])
  );
  panel.append(today, month, remaining);
  return panel;
}
