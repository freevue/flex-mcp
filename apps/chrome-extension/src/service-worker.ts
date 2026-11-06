import { connectBridge, createSyntheticReply } from "./bridge/index.ts";
import type { BridgeControl } from "./bridge/index.ts";
import { readStoredRegistration, requestBridgeTicket } from "./registration/index.ts";
import type { StoredRegistration } from "./registration/index.ts";

const alarmName = "flex-bridge-retry";
let registration: StoredRegistration | null = null;
let control: BridgeControl | undefined;
let queue = Promise.resolve();

function permittedOrigin(origin: string): string {
  const url = new URL(origin);
  return `${url.protocol}//${url.hostname}/*`;
}

function restoreBridge(): void {
  queue = queue.then(async () => {
    await chrome.storage.local.setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" });
    const values = await chrome.storage.local.get("registration");
    const stored = readStoredRegistration(values.registration);
    const next = stored && await chrome.permissions.contains({ origins: [permittedOrigin(stored.origin)] }) ? stored : null;
    if (next && !await chrome.alarms.get(alarmName)) await chrome.alarms.create(alarmName, { periodInMinutes: 0.5 });
    if (!next) await chrome.alarms.clear(alarmName);
    if (registration?.bindingId === next?.bindingId && registration?.origin === next?.origin && control) return;

    registration = next;
    control?.close();
    control = undefined;
    if (!next) {
      await chrome.storage.session.remove("bridgeState");
      return;
    }

    control = connectBridge({
      url: next.origin,
      retryDelayMs: 5_000,
      openSocket: url => new WebSocket(url),
      getTicket: signal => requestBridgeTicket(next, signal),
      onState: status => {
        if (registration === next) {
          void chrome.storage.session.set({ bridgeState: { bindingId: next.bindingId, status } }).catch(() => {});
        }
      },
    }, async request => createSyntheticReply(request, next.bindingId));
  }).catch(() => {
    control?.close();
    control = undefined;
    registration = null;
  });
}

chrome.runtime.onInstalled.addListener(restoreBridge);
chrome.runtime.onStartup.addListener(restoreBridge);
chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === alarmName) restoreBridge(); });
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && Object.hasOwn(changes, "registration")) restoreBridge();
});
chrome.permissions.onRemoved.addListener(restoreBridge);
chrome.runtime.onMessage.addListener((value: unknown, sender) => {
  if (sender.id === chrome.runtime.id && value === "restore-bridge") restoreBridge();
});
restoreBridge();
