import { failure, isFlexUrl, success } from "../../../../shared/index.ts";
import type { Outcome } from "../../../../shared/index.ts";

export type TabCandidate = { id?: number; url?: string; lastAccessed?: number };
export type FlexTab = { id: number; url: string };

export function findFlexTab(tabs: readonly TabCandidate[], selectedTabId?: number):
  Outcome<FlexTab, "FLEX_TAB_UNAVAILABLE"> {
  const eligible = tabs.filter((tab): tab is TabCandidate & FlexTab =>
    typeof tab.id === "number" && Number.isSafeInteger(tab.id) && tab.id >= 0
    && typeof tab.url === "string" && isFlexUrl(tab.url)
    && (selectedTabId === undefined || tab.id === selectedTabId));
  const [tab, next] = eligible.sort((left, right) => (right.lastAccessed ?? 0) - (left.lastAccessed ?? 0));
  if (!tab || (next && (tab.lastAccessed ?? 0) <= (next.lastAccessed ?? 0))) return failure("FLEX_TAB_UNAVAILABLE");
  return success({ id: tab.id, url: tab.url });
}
