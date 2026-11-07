import { isRecord } from "../../../../shared/index.ts";
import type { BrowserQueryFailure, Outcome } from "../../../../shared/index.ts";
import type { StoredRegistration } from "./bridgeApi.ts";
import { pollDevicePairing, readDevicePairingStart, requestDevicePairing } from "./devicePairingApi.ts";

const pairingFields = ["devicePairing", "pendingFlexAccount", "pendingInvitationBinding"];
type PairingIntent = "register" | "invite" | null;
type IdentifyFlex = () => Promise<Outcome<string, BrowserQueryFailure>>;

export function readAccount(value: unknown, binding: string): string | undefined {
  if (isRecord(value) && value.binding === binding && typeof value.account === "string" && /^[a-f0-9]{64}$/.test(value.account)) return value.account;
  return undefined;
}

export function createPairingSession() {
  let lastClaimAt = 0;

  return async (origin: string, registration: StoredRegistration | null, account: string | undefined, intent: PairingIntent, identify?: IdentifyFlex) => {
    const session = await chrome.storage.session.get(pairingFields);
    let pending = readDevicePairingStart(session.devicePairing);
    let pendingAccount = pending ? readAccount(session.pendingFlexAccount, pending.requestKey) : undefined;
    let invitationBinding = typeof session.pendingInvitationBinding === "string" ? session.pendingInvitationBinding : null;
    if (
      pending &&
      (pending.expiresAt <= Date.now() ||
        (intent === "invite" && !invitationBinding) ||
        (invitationBinding ? invitationBinding !== registration?.bindingId : Boolean(identify && !pendingAccount)))
    ) {
      await chrome.storage.session.remove(pairingFields);
      pending = null;
    }

    let inviteFailed = false;
    let claimedRegistration = false;
    if (pending && (intent === "invite" || Date.now() - lastClaimAt >= 2_000)) {
      lastClaimAt = Date.now();
      const result = await pollDevicePairing(origin, pending.requestKey).catch(() => null);
      inviteFailed = intent === "invite" && result === null;
      if (result?.status === "registered" && !invitationBinding) {
        claimedRegistration = true;
        registration = { ...result.registration, origin };
        account = pendingAccount;
        await chrome.storage.local.set({ registration, flexAccount: account ? { binding: registration.bindingId, account } : null });
      }
      if (result && result.status !== "pending") {
        await chrome.storage.session.remove(pairingFields);
        pending = null;
      }
    }

    if (!pending && intent && !claimedRegistration) {
      const invite = intent === "invite";
      if (invite && !registration) return { registration, account, approvalCode: null, invitationCode: null, needsFlex: false, inviteFailed: true };
      if (!invite && identify) {
        const identified = await identify();
        if (!identified.ok) return { registration, account, approvalCode: null, invitationCode: null, needsFlex: true, inviteFailed };
        pendingAccount = identified.value;
      }
      const requested = requestDevicePairing(origin, registration?.deviceKey, invite);
      pending = invite ? await requested.catch(() => null) : await requested;
      inviteFailed = pending === null;
      if (pending) {
        invitationBinding = invite ? (registration?.bindingId ?? null) : null;
        await chrome.storage.session.set({
          devicePairing: pending,
          pendingInvitationBinding: invitationBinding,
          pendingFlexAccount: !invite && pendingAccount ? { binding: pending.requestKey, account: pendingAccount } : null
        });
      }
    }

    const approvalCode = pending?.approvalCode ?? null;
    return { registration, account, approvalCode, invitationCode: invitationBinding && !inviteFailed ? approvalCode : null, needsFlex: false, inviteFailed };
  };
}
