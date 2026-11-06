import { isRecord, parseBridgeOrigin } from "../../../shared/index.ts";
import { pairBrowser, readStoredRegistration, unpairBrowser } from "./registration/index.ts";
import type { StoredRegistration } from "./registration/index.ts";

const form = document.querySelector("form");
const disconnect = document.querySelector<HTMLButtonElement>("#unpair");
const status = document.querySelector("#status");
const message = document.querySelector("#message");
if (!form || !disconnect || !status || !message) throw new Error("연결 설정 화면을 열 수 없습니다.");

let registration: StoredRegistration | null = null;
let busy = false;

async function refresh(): Promise<void> {
  const local = await chrome.storage.local.get("registration");
  registration = readStoredRegistration(local.registration);
  const session = await chrome.storage.session.get("bridgeState");
  const state: unknown = session.bridgeState;
  form!.hidden = Boolean(registration);
  disconnect!.disabled = busy || !registration;
  status!.textContent = registration
    ? `등록 ID: ${registration.bindingId} · ${isRecord(state) && state.bindingId === registration.bindingId
      && state.status === "online" ? "서버 연결됨" : "서버 연결 대기"}`
    : "등록되지 않았습니다.";
}

function finish(): void {
  busy = false;
  void refresh().catch(() => { message!.textContent = "연결 상태를 읽지 못했습니다."; });
}

form.addEventListener("submit", event => {
  event.preventDefault();
  if (busy || registration) return;
  const fields = new FormData(form);
  const address = fields.get("origin");
  const code = fields.get("code");
  const origin = typeof address === "string" ? parseBridgeOrigin(address.trim()) : null;
  if (!origin || typeof code !== "string") {
    message.textContent = "서버 주소와 등록 코드를 확인하세요.";
    return;
  }

  busy = true;
  message.textContent = "";
  void chrome.permissions.request({ origins: [`${origin.protocol}//${origin.hostname}/*`] }).then(async allowed => {
    if (!allowed) throw new Error("서버 접속 권한을 허용하세요.");
    const next = await pairBrowser(origin.origin, code.trim());
    await chrome.storage.local.set({ registration: next });
    form.reset();
  }).catch(error => {
    message.textContent = error instanceof Error && error.name === "Error"
      ? error.message : "등록에 실패했습니다. 서버 주소와 접속 상태를 확인하세요.";
  }).finally(finish);
});

disconnect.addEventListener("click", () => {
  if (busy || !registration) return;
  busy = true;
  disconnect.disabled = true;
  message.textContent = "";
  void unpairBrowser(registration).then(() => chrome.storage.local.remove("registration"))
    .catch(() => { message.textContent = "연결을 해제하지 못했습니다. 서버 상태를 확인하세요."; }).finally(finish);
});
chrome.storage.onChanged.addListener(() => { void refresh().catch(() => {}); });
void refresh().catch(() => { message.textContent = "연결 상태를 읽지 못했습니다."; });
void chrome.runtime.sendMessage("restore-bridge").catch(() => {});
