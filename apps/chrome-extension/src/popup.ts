import {
  popupButton, readPopupSnapshot, renderApprovalCode, renderConnectionRows, renderWorkSummary,
  type PopupCommand, type PopupSnapshot,
} from "./popup/index.ts";

const main = document.querySelector<HTMLElement>("#popup");
const notice = document.querySelector<HTMLElement>("#notice");
const inviteButton = document.querySelector<HTMLButtonElement>('.brand button[data-action="popup-add-agent"]');
if (!main || !notice || !inviteButton) throw new Error("팝업 화면을 찾을 수 없습니다.");
const view = main;
const feedback = notice;
const inviteAction = inviteButton;
let snapshot: PopupSnapshot | undefined;
let inFlight: Promise<void> | undefined;

function setSnapshot(next: PopupSnapshot): void {
  if (JSON.stringify(snapshot) === JSON.stringify(next)) return;
  snapshot = next;
  inviteAction.hidden = next.kind !== "connected" || next.approvalCode !== null;
  const title = document.createElement("h1");
  const description = document.createElement("p");
  if (next.kind === "connected") {
    title.textContent = "연결 상태";
    view.replaceChildren(title, renderConnectionRows(next.flex));
    if (next.approvalCode) view.append(renderApprovalCode(next.approvalCode));
    if (next.inviteFailed) {
      const error = document.createElement("p");
      error.setAttribute("role", "alert");
      error.textContent = "추가 연결 코드를 발급하지 못했습니다. 잠시 뒤 다시 시도하세요.";
      view.append(error);
    }
    if (next.flex !== "unavailable") view.append(renderWorkSummary(next.summary, next.flex));
    else {
      description.textContent = "등록한 계정의 Flex 탭을 연 뒤 다시 확인하세요.";
      view.append(description, popupButton("다시 확인", "popup-state", true));
    }
    return;
  }
  if (next.kind === "error") {
    title.textContent = "연결 확인 실패";
    title.className = "error";
    description.textContent = "팝업 상태를 읽지 못했습니다.";
    view.replaceChildren(title, description, popupButton("다시 확인", "popup-state"));
    return;
  }
  title.textContent = "Chrome 연결";
  description.textContent = "MCP 소켓이 연결되어 있지 않습니다.";
  view.replaceChildren(title, description);
  if (next.needsFlex && !next.approvalCode) {
    const hint = document.createElement("p");
    hint.textContent = "같은 Chrome 프로필에서 Flex에 로그인한 뒤 코드를 발급하세요.";
    view.append(hint);
  }
  if (next.approvalCode) view.append(renderApprovalCode(next.approvalCode));
  else view.append(popupButton("일회용 코드 발급", "popup-issue-code"));
  if (next.canReconnect) view.append(popupButton("다시 연결", "popup-reconnect", true));
}

function runCommand(command: PopupCommand): Promise<void> {
  const result = (inFlight ?? Promise.resolve()).then(async () => {
    const response: unknown = await chrome.runtime.sendMessage(command);
    setSnapshot(readPopupSnapshot(response) ?? { kind: "error" });
  }).catch(() => {
    setSnapshot({ kind: "error" });
  }).finally(() => {
    if (inFlight === result) inFlight = undefined;
  });
  inFlight = result;
  return result;
}

document.addEventListener("click", async (event) => {
  const button = event.target instanceof Element ? event.target.closest("button[data-action]") : null;
  const action = button instanceof HTMLButtonElement ? button.dataset.action : undefined;
  feedback.textContent = "";
  if (action === "popup-issue-code" || action === "popup-reconnect" || action === "popup-state" || action === "popup-add-agent") {
    if (button instanceof HTMLButtonElement) button.disabled = true;
    await runCommand(action);
    if (action === "popup-add-agent") view.querySelector<HTMLButtonElement>('button[data-action="copy"]')?.focus();
    if (button instanceof HTMLButtonElement) button.disabled = false;
    return;
  }
  if (action === "copy" && snapshot && snapshot.kind !== "error" && snapshot.approvalCode) {
    try {
      await navigator.clipboard.writeText(snapshot.approvalCode);
      feedback.textContent = "코드를 복사했습니다.";
    } catch {
      feedback.textContent = "복사할 수 없습니다. 화면에 표시된 코드를 선택해 주세요.";
    }
  }
});

async function refresh(): Promise<void> {
  if (!inFlight) await runCommand("popup-state");
  window.setTimeout(() => { void refresh(); }, snapshot?.kind === "connected" ? 15_000 : 2_000);
}

void refresh();
