import { isRecord } from "../../../shared/index.ts";
import type { BridgeReply, BridgeRequest, BrowserQueryFailure, Outcome } from "../../../shared/index.ts";
import { connectBridge, createSyntheticReply } from "./bridge/index.ts";
import type { BridgeControl } from "./bridge/index.ts";
import { loadExtensionConfiguration } from "./extensionConfiguration.ts";
import { readDemoWorkSummary } from "./flex/index.ts";
import type { PopupCommand, PopupSnapshot } from "./popup/index.ts";
import { pollDevicePairing, readDevicePairingStart, readStoredRegistration, requestBridgeTicket,
  requestDevicePairing } from "./registration/index.ts";
import type { StoredRegistration } from "./registration/index.ts";

type FlexReader = {
  identify: () => Promise<Outcome<string, BrowserQueryFailure>>;
  read: (request: BridgeRequest, account: string, signal: AbortSignal) => Promise<BridgeReply>;
};

const alarmName = "flex-bridge-retry";

function readAccount(value: unknown, binding: string): string | undefined {
  if (isRecord(value) && value.binding === binding && typeof value.account === "string"
    && /^[a-f0-9]{64}$/.test(value.account)) return value.account;
  return undefined;
}

export function startExtension(reader?: FlexReader): void {
  let registration: StoredRegistration | null = null;
  let control: BridgeControl | undefined;
  let queue: Promise<unknown> = Promise.resolve();
  let lastClaimAt = 0;
  let rejectedBinding: string | undefined;
  const configuration = loadExtensionConfiguration().catch(() => null);

  async function updatePopup(command: PopupCommand): Promise<PopupSnapshot> {
    const settings = await configuration;
    if (!settings) return { kind: "error" };
    const liveReader = settings.demo ? undefined : reader;
    await chrome.storage.local.setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" });
    await chrome.storage.session.setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" });
    const local = await chrome.storage.local.get(["registration", "flexAccount"]);
    const saved = readStoredRegistration(local.registration);
    let next = saved?.origin === settings.origin ? saved : null;
    let account = next ? readAccount(local.flexAccount, next.bindingId) : undefined;
    if (next && (next.bindingId === rejectedBinding || (liveReader && !account))) {
      await chrome.storage.local.remove(["registration", "flexAccount"]);
      rejectedBinding = undefined;
      next = null;
      account = undefined;
    }
    const session = await chrome.storage.session.get(["devicePairing", "pendingFlexAccount"]);
    let pending = readDevicePairingStart(session.devicePairing);
    let pendingAccount = pending ? readAccount(session.pendingFlexAccount, pending.requestKey) : undefined;
    if (pending && (pending.expiresAt <= Date.now() || (liveReader && !pendingAccount))) {
      await chrome.storage.session.remove(["devicePairing", "pendingFlexAccount"]);
      pending = null;
    }

    if (command === "popup-issue-code" && control?.state() !== "online" && !pending) {
      if (liveReader) {
        const identified = await liveReader.identify();
        if (!identified.ok) return { kind: "disconnected", canReconnect: Boolean(next), approvalCode: null, needsFlex: true };
        pendingAccount = identified.value;
      }
      pending = await requestDevicePairing(settings.origin, next?.deviceKey);
      await chrome.storage.session.set({ devicePairing: pending,
        pendingFlexAccount: pendingAccount ? { binding: pending.requestKey, account: pendingAccount } : null });
    }
    if (pending && Date.now() - lastClaimAt >= 2_000) {
      lastClaimAt = Date.now();
      const result = await pollDevicePairing(settings.origin, pending.requestKey).catch(() => null);
      if (result?.status === "registered") {
        next = { ...result.registration, origin: settings.origin };
        account = pendingAccount;
        await chrome.storage.local.set({ registration: next,
          flexAccount: account ? { binding: next.bindingId, account } : null });
      }
      if (result && result.status !== "pending") {
        await chrome.storage.session.remove(["devicePairing", "pendingFlexAccount"]);
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
      const activeAccount = account;
      control = connectBridge({
        url: active.origin,
        retryDelayMs: 5_000,
        openSocket: url => new WebSocket(url),
        getTicket: signal => requestBridgeTicket(active, signal, () => {
          if (signal.aborted || registration?.bindingId !== active.bindingId) return;
          rejectedBinding = active.bindingId;
          restoreBridge();
        }),
      }, async (request, signal) => {
        if (settings.demo) return createSyntheticReply(request, active.bindingId);
        if (!liveReader || !activeAccount) return { requestId: request.requestId, error: "FLEX_READ_FAILED" };
        const reply = await liveReader.read(request, activeAccount, signal);
        return "result" in reply ? { ...reply, source: "flex" } : reply;
      });
    }
    if (next || pending) {
      if (!await chrome.alarms.get(alarmName)) await chrome.alarms.create(alarmName, { periodInMinutes: 0.5 });
    } else {
      await chrome.alarms.clear(alarmName);
    }
    if (!next || control?.state() !== "online") {
      return { kind: "disconnected", canReconnect: Boolean(next), approvalCode: pending?.approvalCode ?? null,
        ...(liveReader ? { needsFlex: true } : {}) };
    }
    if (!settings.demo) return { kind: "connected", flex: liveReader && account ? "registered" : "unavailable", summary: null };
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
}
