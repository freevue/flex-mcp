import { authorizeMcpCaller } from "./access/index.ts";
import type { VerifiedCallerIdentity } from "./access/index.ts";
import { forwardFlexQuery } from "./bridge/index.ts";
import type { RelayContext } from "./bridge/index.ts";
import { createMcpServer } from "./createMcpServer.ts";

export function createCallerMcpServer(identity: VerifiedCallerIdentity | null, relay: RelayContext, now?: () => Date) {
  return createMcpServer(async query => {
    const caller = authorizeMcpCaller(identity, relay.access);
    return caller.ok ? forwardFlexQuery(caller.value, query, relay) : caller;
  }, now);
}
