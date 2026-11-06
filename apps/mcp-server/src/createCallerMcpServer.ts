import { authorizeMcpCaller } from "./access/index.ts";
import type { VerifiedCallerIdentity } from "./access/index.ts";
import { forwardFlexQuery } from "./bridge/index.ts";
import type { RelayContext } from "./bridge/index.ts";
import { createMcpServer } from "./createMcpServer.ts";
import { getBrowserConnectionStatus } from "./operations/index.ts";

export function createCallerMcpServer(identity: VerifiedCallerIdentity | null, relay: RelayContext, now?: () => Date, synthetic = false) {
  return createMcpServer({
    query: async query => {
      const caller = authorizeMcpCaller(identity, relay.access);
      return caller.ok ? forwardFlexQuery(caller.value, query, relay) : caller;
    },
    connectionStatus: () => getBrowserConnectionStatus(identity, relay),
  }, now, synthetic);
}
