import { hasKeys, isRecord, isRequestId, parseBridgeOrigin } from "../../../../shared/index.ts";
import type { BridgeRegistration } from "../../../../shared/index.ts";

export type StoredRegistration = BridgeRegistration & { origin: string };

function readRegistration(value: unknown): BridgeRegistration | null {
  if (!isRecord(value) || !hasKeys(value, ["bindingId", "deviceKey"]) || !isRequestId(value.bindingId)
    || typeof value.deviceKey !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(value.deviceKey)) return null;
  return { bindingId: value.bindingId, deviceKey: value.deviceKey };
}

export function readStoredRegistration(value: unknown): StoredRegistration | null {
  if (!isRecord(value) || !hasKeys(value, ["bindingId", "deviceKey", "origin"]) || typeof value.origin !== "string") return null;
  const origin = parseBridgeOrigin(value.origin)?.origin;
  const registration = readRegistration({ bindingId: value.bindingId, deviceKey: value.deviceKey });
  return origin && registration ? { origin, ...registration } : null;
}

function post(origin: string, path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(new URL(path, origin), {
    ...init, method: "POST", cache: "no-store", credentials: "omit", redirect: "error",
    signal: init.signal ? AbortSignal.any([init.signal, AbortSignal.timeout(10_000)]) : AbortSignal.timeout(10_000),
  });
}

export async function pairBrowser(origin: string, code: string): Promise<StoredRegistration> {
  const server = parseBridgeOrigin(origin);
  if (!server || !/^[A-Za-z0-9_-]{43}$/.test(code)) throw new Error("서버 주소와 등록 코드를 확인하세요.");
  const response = await post(server.origin, "/bridge/pair", {
    body: JSON.stringify({ code }), headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("등록에 실패했습니다. 서버 설정과 등록 코드를 확인하세요.");
  const registration = readRegistration(await response.json() as unknown);
  if (!registration) throw new Error("서버에서 올바른 등록 정보를 받지 못했습니다.");
  return { origin: server.origin, ...registration };
}

export async function requestBridgeTicket(registration: StoredRegistration, signal: AbortSignal, onUnauthorized?: () => void): Promise<string> {
  const response = await post(registration.origin, "/bridge/ticket", {
    headers: { Authorization: `Bearer ${registration.deviceKey}` }, signal,
  });
  if (response.status === 401) onUnauthorized?.();
  if (!response.ok) throw new Error("접속권을 받지 못했습니다.");
  const value = await response.json() as unknown;
  if (!isRecord(value) || !hasKeys(value, ["ticket"]) || typeof value.ticket !== "string"
    || !/^[A-Za-z0-9_-]{43}$/.test(value.ticket)) throw new Error("접속권 형식이 올바르지 않습니다.");
  return value.ticket;
}

export async function unpairBrowser(registration: StoredRegistration): Promise<void> {
  const response = await post(registration.origin, "/bridge/unpair", {
    headers: { Authorization: `Bearer ${registration.deviceKey}` },
  });
  if (response.status !== 204 && response.status !== 401) throw new Error("서버에서 연결 해제를 확인하지 못했습니다.");
}
