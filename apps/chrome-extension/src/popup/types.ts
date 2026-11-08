import type { WorkStatusResult } from "../../../../shared/index.ts";
import type { PopupWorkSummary } from "../flex/workSummary.ts";

type Connected = { kind: "connected"; approvalCode: string | null; inviteFailed: boolean; workStatus: WorkStatusResult["status"] };
export type PopupSnapshot =
  | { kind: "disconnected"; canReconnect: boolean; approvalCode: string | null; needsFlex?: true }
  | (Connected & ({ flex: "unavailable"; summary: null } | { flex: "synthetic" | "live"; summary: PopupWorkSummary }))
  | { kind: "error" };
export type PopupCommand = "popup-open" | "popup-state" | "popup-issue-code" | "popup-reconnect" | "popup-check-code";
