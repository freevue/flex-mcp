import { hasKeys, isRecord } from "./validation.ts";

export type WorkStatusResult = { status: "working" | "on_break" | "idle" | "unknown" };
export const demoWorkStatus: WorkStatusResult = { status: "working" };

/** 근무 상태 응답을 검증합니다. @see wiki/unit/shared/isWorkStatusResult.md */
export function isWorkStatusResult(value: unknown): value is WorkStatusResult {
  if (!isRecord(value) || !hasKeys(value, ["status"])) return false;
  return value.status === "working" || value.status === "on_break" || value.status === "idle" || value.status === "unknown";
}
