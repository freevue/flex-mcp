import { hasKeys, isRecord, parseBridgeOrigin } from "../../../../shared/index.ts";
import type { DevicePairingClaim, DevicePairingStart } from "../../../../shared/index.ts";
import { readStoredRegistration } from "./bridgeApi.ts";

export function readDevicePairingStart(value: unknown): DevicePairingStart | null {
  if (!isRecord(value) || !hasKeys(value, ["approvalCode", "requestKey", "expiresAt"])
    || typeof value.approvalCode !== "string" || !/^[0-9A-F]{4}(?:-[0-9A-F]{4}){2}$/.test(value.approvalCode)
    || typeof value.requestKey !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(value.requestKey)
    || typeof value.expiresAt !== "number" || !Number.isSafeInteger(value.expiresAt)) return null;
  return { approvalCode: value.approvalCode, requestKey: value.requestKey, expiresAt: value.expiresAt };
}

async function postPairing(origin: string, path: string, headers: HeadersInit = {}): Promise<unknown> {
  const url = parseBridgeOrigin(origin);
  if (!url) throw new Error("배포 서버 주소가 올바르지 않습니다.");
  const reply = await fetch(new URL(path, url), {
    method: "POST", headers, credentials: "omit", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(5_000),
  });
  if (!reply.ok) throw new Error("서버의 연결 등록 응답을 확인하세요.");
  return reply.json();
}

export async function requestDevicePairing(origin: string, deviceKey?: string, invite = false): Promise<DevicePairingStart> {
  const headers = deviceKey ? { Authorization: `Bearer ${deviceKey}` } : undefined;
  const started = readDevicePairingStart(await postPairing(origin, invite ? "/bridge/pair/invite" : "/bridge/pair/start", headers));
  if (!started) throw new Error("승인 코드를 확인할 수 없습니다.");
  return started;
}

export async function pollDevicePairing(origin: string, requestKey: string): Promise<DevicePairingClaim> {
  const value = await postPairing(origin, "/bridge/pair/claim", { Authorization: `Bearer ${requestKey}` });
  if (!isRecord(value)) throw new Error("승인 결과를 확인할 수 없습니다.");
  if ((value.status === "pending" || value.status === "unavailable" || value.status === "linked") && hasKeys(value, ["status"])) {
    return { status: value.status };
  }
  if (value.status === "registered" && hasKeys(value, ["status", "registration"]) && isRecord(value.registration)) {
    const registration = readStoredRegistration({ ...value.registration, origin });
    if (registration) return { status: "registered", registration: { bindingId: registration.bindingId, deviceKey: registration.deviceKey } };
  }
  throw new Error("승인 결과를 확인할 수 없습니다.");
}
