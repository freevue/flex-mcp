import type { PopupWorkSummary } from "../flex/workSummary.ts";

export type PopupSnapshot =
  | { kind: "disconnected"; canReconnect: boolean; approvalCode: string | null; needsFlex?: true }
  | { kind: "connected"; flex: "unavailable" | "synthetic" | "registered"; summary: PopupWorkSummary | null }
  | { kind: "error" };
export type PopupCommand = "popup-state" | "popup-issue-code" | "popup-reconnect";
