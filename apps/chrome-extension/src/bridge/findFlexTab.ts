import { failure, isFlexUrl, success } from "../../../../shared/index.ts";
import type { Outcome } from "../../../../shared/index.ts";

export type TabCandidate = { id?: number; url?: string };
export type FlexTab = { id: number; url: string };

export function findFlexTab(tabs: readonly TabCandidate[], selectedTabId?: number):
  Outcome<FlexTab, "FLEX_TAB_UNAVAILABLE"> {
  const eligible = tabs.filter((tab): tab is FlexTab =>
    typeof tab.id === "number" && Number.isSafeInteger(tab.id) && tab.id >= 0
    && typeof tab.url === "string" && isFlexUrl(tab.url)
    && (selectedTabId === undefined || tab.id === selectedTabId));
  const [tab] = eligible;
  return eligible.length === 1 && tab ? success({ id: tab.id, url: tab.url }) : failure("FLEX_TAB_UNAVAILABLE");
}
