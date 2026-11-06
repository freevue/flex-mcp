import type { PopupWorkSummary } from "../flex/workSummary.ts";

export type PopupSnapshot =
  | { kind: "disconnected"; canReconnect: boolean; approvalCode: string | null; needsFlex?: true }
  | { kind: "connected"; flex: "unavailable"; summary: null }
  | { kind: "connected"; flex: "synthetic" | "live"; summary: PopupWorkSummary }
  | { kind: "error" };
export type PopupCommand = "popup-state" | "popup-issue-code" | "popup-reconnect";
