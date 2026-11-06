import { failure } from "../../../shared/index.ts";
import { authorizeMcpCaller } from "./access/authorizeMcpCaller.ts";
import { forwardFlexQuery } from "./bridge/forwardFlexQuery.ts";
import type { RelayContext } from "./bridge/types.ts";
import { createMcpServer } from "./createMcpServer.ts";
import { getBrowserConnectionStatus } from "./operations/getBrowserConnectionStatus.ts";
import { approveDevicePairing } from "./registration/devicePairing.ts";
import { isSecret, secretDigest } from "./registration/stateDatabase.ts";
import type { StateDatabase } from "./registration/stateDatabase.ts";

export function createPairedMcpServer(database: StateDatabase, relay: RelayContext, allowApproval = () => true) {
  function findChannel(connectionKey?: string) {
    if (!isSecret(connectionKey)) return null;
    const callerId = secretDigest(connectionKey);
    const ownerId = relay.access.findOwner(callerId);
    return ownerId ? { callerId, ownerId } : null;
  }

  return createMcpServer({
    channelPairing: true,
    query: async (query, connectionKey) => {
      const identity = findChannel(connectionKey);
      if (!identity) return failure("ACCESS_DENIED");
      const caller = authorizeMcpCaller(identity, relay.access);
      return caller.ok ? forwardFlexQuery(caller.value, query, relay, true) : caller;
    },
    connectionStatus: connectionKey => {
      const identity = findChannel(connectionKey);
      return identity ? getBrowserConnectionStatus(identity, relay) : failure("ACCESS_DENIED");
    },
    approveConnection: code => allowApproval() ? approveDevicePairing(database, code) : null,
  });
}
