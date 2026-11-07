import { isFlexUrl } from "../../../../shared/index.ts";
import type { BridgeReply, BridgeRequest, BrowserQueryFailure, FlexQuery, FlexResult, Outcome } from "../../../../shared/index.ts";
import type { FlexTab } from "./findFlexTab.ts";

type TabDocument = { id: string; url: string };

export type TabRuntime = {
  getDocument: (tabId: number) => Promise<TabDocument | null>;
  execute: (tabId: number, documentId: string, query: FlexQuery, signal: AbortSignal) => Promise<Outcome<FlexResult, BrowserQueryFailure>>;
};

export async function dispatchToFlexTab(tab: FlexTab, request: BridgeRequest, signal: AbortSignal, runtime: TabRuntime): Promise<BridgeReply> {
  const { requestId, query } = request;
  const unavailable = { requestId, error: "FLEX_TAB_UNAVAILABLE" } as const;
  const aborted = { requestId, error: "FLEX_READ_FAILED" } as const;
  if (signal.aborted || query.kind === "summary") return aborted;
  if (!isFlexUrl(tab.url)) return unavailable;
  const before = await runtime.getDocument(tab.id).catch(() => null);
  if (signal.aborted) return aborted;
  if (!before || before.url !== tab.url || !isFlexUrl(before.url)) return unavailable;

  const result = await runtime.execute(tab.id, before.id, query, signal).catch(() => ({ ok: false, error: "FLEX_READ_FAILED" }) as const);
  if (signal.aborted) return aborted;
  const after = await runtime.getDocument(tab.id).catch(() => null);
  if (signal.aborted) return aborted;
  if (!after || after.id !== before.id || !isFlexUrl(after.url)) return unavailable;
  return result.ok ? { requestId, result: result.value } : { requestId, error: result.error };
}
