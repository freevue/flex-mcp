import {
  popupButton, readPopupSnapshot, renderApprovalCode, renderConnectionRows, renderWorkSummary,
  type PopupCommand, type PopupSnapshot,
} from "./popup/index.ts";

const main = document.querySelector<HTMLElement>("#popup");
const notice = document.querySelector<HTMLElement>("#notice");
if (!main || !notice) throw new Error("팝업 화면을 찾을 수 없습니다.");
const view = main;
const feedback = notice;
let snapshot: PopupSnapshot | undefined;
let inFlight: Promise<void> | undefined;

function setSnapshot(next: PopupSnapshot): void {
  if (JSON.stringify(snapshot) === JSON.stringify(next)) return;
  snapshot = next;
  const title = document.createElement("h1");
  const description = document.createElement("p");
  if (next.kind === "connected") {
    title.textContent = "연결 상태";
    view.replaceChildren(title, renderConnectionRows(next.flex));
    if (next.summary) view.append(renderWorkSummary(next.summary));
    else {
      description.textContent = "Flex 조회가 연결되면 근무 시간을 표시합니다.";
      view.append(description);
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

view.addEventListener("click", async (event) => {
  const button = event.target instanceof Element ? event.target.closest("button[data-action]") : null;
  const action = button instanceof HTMLButtonElement ? button.dataset.action : undefined;
  feedback.textContent = "";
  if (action === "popup-issue-code" || action === "popup-reconnect" || action === "popup-state") {
    if (button instanceof HTMLButtonElement) button.disabled = true;
    await runCommand(action);
    if (button instanceof HTMLButtonElement) button.disabled = false;
    return;
  }
  if (action === "copy" && snapshot?.kind === "disconnected" && snapshot.approvalCode) {
    try {
      await navigator.clipboard.writeText(snapshot.approvalCode);
      feedback.textContent = "코드를 복사했습니다.";
    } catch {
      feedback.textContent = "복사할 수 없습니다. 화면에 표시된 코드를 선택해 주세요.";
    }
  }
});

void runCommand("popup-state");
window.setInterval(() => { if (!inFlight) void runCommand("popup-state"); }, 2000);
