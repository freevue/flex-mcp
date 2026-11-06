import { connectBridge, createSyntheticReply } from "./bridge/index.ts";
import type { BridgeControl } from "./bridge/index.ts";
import { loadExtensionConfiguration } from "./extensionConfiguration.ts";
import { readDemoWorkSummary } from "./flex/index.ts";
import type { PopupCommand, PopupSnapshot } from "./popup/index.ts";
import { pollDevicePairing, readDevicePairingStart, readStoredRegistration, requestBridgeTicket,
  requestDevicePairing } from "./registration/index.ts";
import type { StoredRegistration } from "./registration/index.ts";

const alarmName = "flex-bridge-retry";
let registration: StoredRegistration | null = null;
let control: BridgeControl | undefined;
let queue: Promise<unknown> = Promise.resolve();
let lastClaimAt = 0;
let rejectedBinding: string | undefined;
const configuration = loadExtensionConfiguration().catch(() => null);

async function updatePopup(command: PopupCommand): Promise<PopupSnapshot> {
  const settings = await configuration;
  if (!settings) return { kind: "error" };
  await chrome.storage.local.setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" });
  await chrome.storage.session.setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" });
  const local = await chrome.storage.local.get("registration");
  const saved = readStoredRegistration(local.registration);
  let next = saved?.origin === settings.origin ? saved : null;
  if (next && next.bindingId === rejectedBinding) {
    await chrome.storage.local.remove("registration");
    rejectedBinding = undefined;
    next = null;
  }
  const session = await chrome.storage.session.get("devicePairing");
  let pending = readDevicePairingStart(session.devicePairing);
  if (pending && pending.expiresAt <= Date.now()) {
    await chrome.storage.session.remove("devicePairing");
    pending = null;
  }

  if (command === "popup-issue-code" && control?.state() !== "online" && !pending) {
    pending = await requestDevicePairing(settings.origin);
    await chrome.storage.session.set({ devicePairing: pending });
  }
  if (pending && Date.now() - lastClaimAt >= 2_000) {
    lastClaimAt = Date.now();
    const result = await pollDevicePairing(settings.origin, pending.requestKey).catch(() => null);
    if (result?.status === "registered") {
      next = { ...result.registration, origin: settings.origin };
      await chrome.storage.local.set({ registration: next });
    }
    if (result && result.status !== "pending") {
      await chrome.storage.session.remove("devicePairing");
      pending = null;
    }
  }

  if (next?.bindingId !== registration?.bindingId || (command === "popup-reconnect" && control?.state() !== "online")) {
    control?.close();
    control = undefined;
    registration = next;
  }
  if (next && !control) {
    const active = next;
    control = connectBridge({
      url: active.origin,
      retryDelayMs: 5_000,
      openSocket: url => new WebSocket(url),
      getTicket: signal => requestBridgeTicket(active, signal, () => {
        if (signal.aborted || registration?.bindingId !== active.bindingId) return;
        rejectedBinding = active.bindingId;
        restoreBridge();
      }),
    }, async request => settings.demo ? createSyntheticReply(request, active.bindingId)
      : { requestId: request.requestId, error: "FLEX_READ_FAILED" });
  }
  if (next || pending) {
    if (!await chrome.alarms.get(alarmName)) await chrome.alarms.create(alarmName, { periodInMinutes: 0.5 });
  } else {
    await chrome.alarms.clear(alarmName);
  }
  if (!next || control?.state() !== "online") {
    return { kind: "disconnected", canReconnect: Boolean(next), approvalCode: pending?.approvalCode ?? null };
  }
  if (!settings.demo) return { kind: "connected", flex: "unavailable", summary: null };
  const summary = await readDemoWorkSummary(next.bindingId, AbortSignal.timeout(3_000));
  if (control?.state() !== "online") {
    return { kind: "disconnected", canReconnect: true, approvalCode: pending?.approvalCode ?? null };
  }
  return summary ? { kind: "connected", flex: "synthetic", summary }
    : { kind: "connected", flex: "unavailable", summary: null };
}

function enqueue(command: PopupCommand): Promise<PopupSnapshot> {
  const result = queue.then(() => updatePopup(command)).catch((): PopupSnapshot => ({ kind: "error" }));
  queue = result;
  return result;
}

function restoreBridge(): void {
  void enqueue("popup-state");
}

chrome.runtime.onInstalled.addListener(restoreBridge);
chrome.runtime.onStartup.addListener(restoreBridge);
chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === alarmName) restoreBridge(); });
chrome.runtime.onMessage.addListener((value: unknown, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id || sender.url !== chrome.runtime.getURL("popup.html")) return;
  if (value !== "popup-state" && value !== "popup-issue-code" && value !== "popup-reconnect") return;
  void enqueue(value).then(sendResponse);
  return true;
});
restoreBridge();
