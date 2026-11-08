import { demoWorkStatus, isWorkStatusResult, workSummaryTimeoutMs } from "../../../shared/index.ts";
import { connectBridge, createSyntheticReply, readLiveReply } from "./bridge/index.ts";
import type { BridgeControl, FlexReader } from "./bridge/index.ts";
import { loadExtensionConfiguration } from "./extensionConfiguration.ts";
import { readDemoWorkSummary } from "./flex/index.ts";
import type { PopupCommand, PopupSnapshot } from "./popup/index.ts";
import { createPairingSession, readAccount, readStoredRegistration, requestBridgeTicket } from "./registration/index.ts";
import type { StoredRegistration } from "./registration/index.ts";

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
    const intent = (command === "popup-open" && !next) || (command === "popup-issue-code" && control?.state() !== "online") ? "register" : null;
    const pairing = await updatePairing(settings.origin, next, account, intent, liveReader?.identify);
    const approvalCode = pairing.invitationCode ? null : pairing.approvalCode;
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
      control = connectBridge(
        {
          url: active.origin,
          retryDelayMs: 5_000,
          openSocket: (url) => new WebSocket(url),
          getTicket: (signal) =>
            requestBridgeTicket(active, signal, () => {
              if (signal.aborted || registration?.bindingId !== active.bindingId) return;
              rejectedBinding = active.bindingId;
              restoreBridge();
            })
        },
        async (request, signal) => {
          if (settings.demo) return createSyntheticReply(request, active.bindingId, signal);
          if (!liveReader || !activeAccount) return { requestId: request.requestId, error: "FLEX_READ_FAILED" };
          return readLiveReply(liveReader, request, activeAccount, signal);
        }
      );
    }
    if (next || approvalCode) {
      if (!(await chrome.alarms.get(alarmName))) await chrome.alarms.create(alarmName, { periodInMinutes: 0.5 });
    } else {
      await chrome.alarms.clear(alarmName);
    }
    if (!next || control?.state() !== "online") {
      return { kind: "disconnected", canReconnect: Boolean(next), approvalCode, ...(liveReader ? { needsFlex: true } : {}) };
    }
    if (command === "restore") return { kind: "connected", flex: "unavailable", summary: null, workStatus: "unknown", approvalCode: null, inviteFailed: false };
    const [summary, status] = await Promise.all([
      settings.demo
        ? readDemoWorkSummary(next.bindingId, AbortSignal.timeout(3_000))
        : liveReader && account
          ? liveReader.workSummary(account, AbortSignal.timeout(workSummaryTimeoutMs)).catch(() => null)
          : null,
      !settings.demo && account ? liveReader?.workStatus?.(account, AbortSignal.timeout(3_000)).catch(() => null) : null
    ]);
    const checkedStatus = status?.ok && isWorkStatusResult(status.value) ? status.value.status : "unknown";
    if (control?.state() !== "online") {
      return { kind: "disconnected", canReconnect: true, approvalCode };
    }
    if (!summary) return { kind: "connected", flex: "unavailable", summary: null, workStatus: "unknown", approvalCode: null, inviteFailed: false };
    const invitation = command === "popup-check-code" ? await updatePairing(settings.origin, next, account, "invite", liveReader?.identify) : pairing;
    if (control?.state() !== "online") return { kind: "disconnected", canReconnect: true, approvalCode: null };
    return {
      kind: "connected",
      flex: settings.demo ? "synthetic" : "live",
      summary,
      workStatus: settings.demo ? demoWorkStatus.status : checkedStatus,
      approvalCode: invitation.invitationCode,
      inviteFailed: invitation.inviteFailed
    };
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
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === alarmName) restoreBridge();
  });
  chrome.runtime.onMessage.addListener((value: unknown, sender, sendResponse) => {
    if (sender.id !== chrome.runtime.id || sender.url !== chrome.runtime.getURL("popup.html")) return;
    if (value !== "popup-open" && value !== "popup-state" && value !== "popup-issue-code" && value !== "popup-reconnect" && value !== "popup-check-code")
      return;
    void enqueue(value).then(sendResponse);
    return true;
  });
  restoreBridge();
}
