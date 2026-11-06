import type { BridgeReply, BridgeRequest, BrowserQueryFailure, Outcome } from "../../../shared/index.ts";
import { connectBridge, createSyntheticReply } from "./bridge/index.ts";
import type { BridgeControl } from "./bridge/index.ts";
import { loadExtensionConfiguration } from "./extensionConfiguration.ts";
import { readDemoWorkSummary } from "./flex/index.ts";
import type { PopupWorkSummary } from "./flex/index.ts";
import type { PopupCommand, PopupSnapshot } from "./popup/index.ts";
import { createPairingSession, readAccount, readStoredRegistration, requestBridgeTicket } from "./registration/index.ts";
import type { StoredRegistration } from "./registration/index.ts";

type FlexReader = {
  identify: () => Promise<Outcome<string, BrowserQueryFailure>>;
  read: (request: BridgeRequest, account: string, signal: AbortSignal) => Promise<BridgeReply>;
  workSummary: (account: string, signal: AbortSignal) => Promise<PopupWorkSummary | null>;
};

type WorkerCommand = PopupCommand | "restore";
const alarmName = "flex-bridge-retry";

export function startExtension(reader?: FlexReader): void {
  let registration: StoredRegistration | null = null;
  let control: BridgeControl | undefined;
  let queue: Promise<unknown> = Promise.resolve();
  let rejectedBinding: string | undefined;
  const updatePairing = createPairingSession();
  const configuration = loadExtensionConfiguration().catch(() => null);

  async function updatePopup(command: WorkerCommand): Promise<PopupSnapshot> {
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
    const online = control?.state() === "online";
    const intent = command === "popup-issue-code" && !online ? "register"
      : command === "popup-add-agent" && online ? "invite" : null;
    const pairing = await updatePairing(settings.origin, next, account, intent, liveReader?.identify);
    const { approvalCode, invitationCode, inviteFailed } = pairing;
    const invitation = { approvalCode: invitationCode, inviteFailed };
    if (pairing.needsFlex) return { kind: "disconnected", canReconnect: Boolean(next), approvalCode, needsFlex: true };
    next = pairing.registration;
    account = pairing.account;

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
    if (next || approvalCode) {
      if (!await chrome.alarms.get(alarmName)) await chrome.alarms.create(alarmName, { periodInMinutes: 0.5 });
    } else {
      await chrome.alarms.clear(alarmName);
    }
    if (!next || control?.state() !== "online") {
      return { kind: "disconnected", canReconnect: Boolean(next), approvalCode,
        ...(liveReader ? { needsFlex: true } : {}) };
    }
    if (command === "restore") return { kind: "connected", flex: "unavailable", summary: null, ...invitation };
    const summary = settings.demo ? await readDemoWorkSummary(next.bindingId, AbortSignal.timeout(3_000))
      : liveReader && account ? await liveReader.workSummary(account, AbortSignal.timeout(20_000)).catch(() => null) : null;
    if (control?.state() !== "online") {
      return { kind: "disconnected", canReconnect: true, approvalCode };
    }
    return summary ? { kind: "connected", flex: settings.demo ? "synthetic" : "live", summary, ...invitation }
      : { kind: "connected", flex: "unavailable", summary: null, ...invitation };
  }

  function enqueue(command: WorkerCommand): Promise<PopupSnapshot> {
    const result = queue.then(() => updatePopup(command)).catch((): PopupSnapshot => ({ kind: "error" }));
    queue = result;
    return result;
  }

  function restoreBridge(): void {
    void enqueue("restore");
  }

  chrome.runtime.onInstalled.addListener(restoreBridge);
  chrome.runtime.onStartup.addListener(restoreBridge);
  chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === alarmName) restoreBridge(); });
  chrome.runtime.onMessage.addListener((value: unknown, sender, sendResponse) => {
    if (sender.id !== chrome.runtime.id || sender.url !== chrome.runtime.getURL("popup.html")) return;
    if (value !== "popup-state" && value !== "popup-issue-code" && value !== "popup-reconnect" && value !== "popup-add-agent") return;
    void enqueue(value).then(sendResponse);
    return true;
  });
  restoreBridge();
}
