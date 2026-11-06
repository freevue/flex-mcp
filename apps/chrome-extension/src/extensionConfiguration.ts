import { hasKeys, isRecord, parseBridgeOrigin } from "../../../shared/index.ts";

export type ExtensionConfiguration = { origin: string; demo: boolean };

export async function loadExtensionConfiguration(): Promise<ExtensionConfiguration> {
  const response = await fetch(chrome.runtime.getURL("extension-config.json"), { cache: "no-store" });
  const value: unknown = await response.json();
  if (!response.ok || !isRecord(value) || !hasKeys(value, ["origin", "demo"])
    || typeof value.origin !== "string" || typeof value.demo !== "boolean") throw new Error("확장 배포 설정을 읽을 수 없습니다.");
  const url = parseBridgeOrigin(value.origin);
  if (!url) throw new Error("확장 배포 서버 주소가 올바르지 않습니다.");
  return { origin: url.origin, demo: value.demo };
}
