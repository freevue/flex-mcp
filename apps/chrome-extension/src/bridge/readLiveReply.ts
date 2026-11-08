import { isWorkStatusResult, workSummaryTimeoutMs } from "../../../../shared/index.ts";
import type { BridgeReply, BridgeRequest, BrowserQueryFailure, Outcome, WorkStatusResult } from "../../../../shared/index.ts";
import type { PopupWorkSummary } from "../flex/index.ts";

export type FlexReader = {
  identify: () => Promise<Outcome<string, BrowserQueryFailure>>;
  read: (request: BridgeRequest, account: string, signal: AbortSignal) => Promise<BridgeReply>;
  workSummary: (account: string, signal: AbortSignal) => Promise<PopupWorkSummary | null>;
  workStatus?: (account: string, signal: AbortSignal) => Promise<Outcome<WorkStatusResult, BrowserQueryFailure>>;
};

/** 승인한 계정의 Flex 읽기 결과를 응답으로 바꿉니다. @see wiki/unit/bridge/readLiveReply.md */
export async function readLiveReply(reader: FlexReader, request: BridgeRequest, account: string, signal: AbortSignal): Promise<BridgeReply> {
  const { requestId, query } = request;
  const failed = { requestId, error: "FLEX_READ_FAILED" } as const;
  if (signal.aborted) return failed;
  if (query.kind === "workStatus") {
    const state = await reader.workStatus?.(account, signal).catch(() => null);
    if (signal.aborted) return failed;
    if (state && !state.ok) return { requestId, error: state.error };
    const result = isWorkStatusResult(state?.value) ? state.value : ({ status: "unknown" } as const);
    return { requestId, result, source: "flex" };
  }
  if (query.kind === "summary") {
    const bounded = AbortSignal.any([signal, AbortSignal.timeout(workSummaryTimeoutMs)]);
    const summary = await reader.workSummary(account, bounded);
    return summary && !bounded.aborted ? { requestId, result: summary, source: "flex" } : failed;
  }
  const reply = await reader.read(request, account, signal);
  return "result" in reply ? { ...reply, source: "flex" } : reply;
}
