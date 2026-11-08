import {
  popupButton,
  readPopupSnapshot,
  renderConnectionRows,
  renderUnavailablePopup,
  renderWorkSummary,
  type PopupCommand,
  type PopupSnapshot
} from "./popup/index.ts";
const main = document.querySelector<HTMLElement>("#popup");
const notice = document.querySelector<HTMLElement>("#notice");
const inviteButton = document.querySelector<HTMLButtonElement>('button[data-action="popup-check-code"]');
const popover = document.querySelector<HTMLElement>("#code-popover");
const code = popover?.querySelector("code");
const message = popover?.querySelector("span");
if (!main || !notice || !inviteButton || !popover || !code || !message) throw new Error("팝업 화면을 찾을 수 없습니다.");
const [view, feedback, inviteAction, preview, previewCode, previewMessage] = [main, notice, inviteButton, popover, code, message] as const;
let snapshot: PopupSnapshot | undefined;
let inFlight: Promise<void> | undefined;

function closeCodePreview(): void {
  preview.hidden = true;
  previewCode.textContent = "";
  previewMessage.textContent = "";
  inviteAction.setAttribute("aria-expanded", "false");
}

function setSnapshot(next: PopupSnapshot): void {
  if (JSON.stringify(snapshot) === JSON.stringify(next)) return;
  snapshot = next;
  const active = next.kind === "connected" && next.flex !== "unavailable";
  inviteAction.hidden = !active;
  if (!active || (previewCode.textContent && previewCode.textContent !== next.approvalCode)) closeCodePreview();
  if (next.kind !== "connected") {
    view.replaceChildren(...renderUnavailablePopup(next));
    return;
  }
  const title = document.createElement("h1");
  title.textContent = "연결 상태";
  title.className = "visually-hidden";
  view.replaceChildren(title, renderConnectionRows(next.flex));
  if (next.flex !== "unavailable") {
    view.append(renderWorkSummary(next.summary, next.flex, next.workStatus));
  } else {
    const description = document.createElement("p");
    description.textContent = "등록한 계정의 Flex 탭을 연 뒤 다시 확인하세요.";
    view.append(description, popupButton("다시 확인", "popup-state", true));
  }
}

function runCommand(command: PopupCommand): Promise<void> {
  const result = (inFlight ?? Promise.resolve())
    .then(async () => {
      const response: unknown = await chrome.runtime.sendMessage(command);
      setSnapshot(readPopupSnapshot(response) ?? { kind: "error" });
    })
    .catch(() => {
      setSnapshot({ kind: "error" });
    })
    .finally(() => {
      if (inFlight === result) inFlight = undefined;
    });
  inFlight = result;
  return result;
}

async function copyPendingCode(pending: Promise<string | null>): Promise<boolean> {
  try {
    const data = pending.then((value) => {
      if (!value) throw new Error("복사할 코드가 없습니다.");
      return new Blob([value], { type: "text/plain" });
    });
    void data.catch(() => {});
    await navigator.clipboard.write([new ClipboardItem({ "text/plain": data })]);
    return true;
  } catch {
    return false;
  }
}

async function checkCode(): Promise<void> {
  if (inviteAction.getAttribute("aria-busy") === "true") return;
  inviteAction.setAttribute("aria-busy", "true");
  closeCodePreview();
  try {
    const pending = runCommand("popup-check-code").then(() =>
      snapshot?.kind === "connected" && snapshot.flex !== "unavailable" && !snapshot.inviteFailed ? snapshot.approvalCode : null
    );
    const [value, copied] = await Promise.all([pending, copyPendingCode(pending)]);
    if (inviteAction.hidden || snapshot?.kind !== "connected" || snapshot.approvalCode !== value) return;
    previewCode.textContent = value ?? "";
    previewCode.hidden = value === null;
    previewMessage.textContent = !value
      ? "코드를 불러오지 못했습니다. 다시 시도하세요."
      : copied
        ? "코드를 복사했습니다."
        : "복사하지 못했습니다. 코드를 직접 선택하세요.";
    preview.hidden = false;
    inviteAction.setAttribute("aria-expanded", "true");
  } finally {
    inviteAction.removeAttribute("aria-busy");
  }
}

document.addEventListener("click", async (event) => {
  const button = event.target instanceof Element ? event.target.closest("button[data-action]") : null;
  const action = button instanceof HTMLButtonElement ? button.dataset.action : undefined;
  if (action === "popup-check-code") {
    await checkCode();
    return;
  }
  if (event.target instanceof Node && !preview.contains(event.target)) closeCodePreview();
  feedback.textContent = "";
  if (action === "popup-issue-code" || action === "popup-reconnect" || action === "popup-state" || action === "popup-open") {
    if (button instanceof HTMLButtonElement) button.disabled = true;
    await runCommand(action);
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

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || preview.hidden) return;
  event.preventDefault();
  closeCodePreview();
  inviteAction.focus();
});

async function refresh(first = false): Promise<void> {
  if (!inFlight) await runCommand(first ? "popup-open" : "popup-state");
  window.setTimeout(
    () => {
      void refresh();
    },
    snapshot?.kind === "connected" ? 15_000 : 2_000
  );
}

void refresh(true);
