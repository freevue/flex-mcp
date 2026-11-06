import type { PopupWorkSummary } from "../flex/workSummary.ts";

export type PopupSnapshot =
  | { kind: "disconnected"; canReconnect: boolean; approvalCode: string | null }
  | { kind: "connected"; flex: "unavailable" | "synthetic"; summary: PopupWorkSummary | null }
  | { kind: "error" };
export type PopupCommand = "popup-state" | "popup-issue-code" | "popup-reconnect";
