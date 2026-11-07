import type { BridgeError, BridgeQuery, BridgeRequest, BridgeResult, Outcome } from "../../../../shared/index.ts";
import type { AccessState, AuthorizedCaller, BrowserBinding } from "../access/types.ts";

export type RelayFailure = BridgeError | "ACCESS_DENIED" | "QUERY_LIMIT_REACHED";
export type BrowserConnection = BrowserBinding & {
  isOpen: () => boolean;
  send: (request: BridgeRequest) => void;
  close: () => void;
  onReply: (receive: (value: unknown) => void) => void;
  onClose: (receive: () => void) => void;
};

export type PendingQuery = {
  connection: BrowserConnection;
  caller: AuthorizedCaller;
  query: BridgeQuery;
  finish: (result: Outcome<BridgeResult, RelayFailure>, source?: "flex") => void;
};
export type BridgeRegistry = {
  active: Map<string, BrowserConnection>;
  pending: Map<string, PendingQuery>;
};
export type RelayContext = {
  access: AccessState;
  registry: BridgeRegistry;
  timeoutMs: number;
  maxPending: number;
};
