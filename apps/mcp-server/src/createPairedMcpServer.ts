import { z as schema } from "zod";
import { failure } from "../../../shared/index.ts";
import { authorizeMcpCaller, disconnectMcpConnection } from "./access/index.ts";
import { forwardFlexQuery } from "./bridge/forwardFlexQuery.ts";
import type { RelayContext } from "./bridge/types.ts";
import { connectionKeyField, createMcpServer } from "./createMcpServer.ts";
import { getBrowserConnectionStatus } from "./operations/getBrowserConnectionStatus.ts";
import { approveDevicePairing } from "./registration/devicePairing.ts";
import { isSecret, secretDigest } from "./registration/stateDatabase.ts";
import type { StateDatabase } from "./registration/stateDatabase.ts";
import { errorReply, errors, successReply } from "./toolReplies.ts";

export function createPairedMcpServer(database: StateDatabase, relay: RelayContext, allowApproval = () => true) {
  function findChannel(connectionKey?: string) {
    if (!isSecret(connectionKey)) return null;
    const callerId = secretDigest(connectionKey);
    const ownerId = relay.access.findOwner(callerId);
    return ownerId ? { callerId, ownerId } : null;
  }

  const server = createMcpServer({
    channelPairing: true,
    query: async (query, connectionKey) => {
      const identity = findChannel(connectionKey);
      if (!identity) return failure("ACCESS_DENIED");
      const caller = authorizeMcpCaller(identity, relay.access);
      return caller.ok ? forwardFlexQuery(caller.value, query, relay, true) : caller;
    },
    connectionStatus: (connectionKey) => {
      const identity = findChannel(connectionKey);
      return identity ? getBrowserConnectionStatus(identity, relay) : failure("ACCESS_DENIED");
    },
    approveConnection: (code) => (allowApproval() ? approveDevicePairing(database, code) : null)
  });

  server.registerTool(
    "flex_disconnect_connection",
    {
      title: "내 MCP 연결 해제",
      description:
        "사용자가 연결 해제를 요청한 경우에만 실행합니다. 현재 MCP 연결 키를 폐기하고 마지막 키면 Chrome 등록과 소켓을 해제합니다. 해제한 키는 다시 쓸 수 없습니다.",
      inputSchema: schema.strictObject({ connectionKey: connectionKeyField }),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false }
    },
    ({ connectionKey }) => {
      try {
        const identity = findChannel(connectionKey);
        if (!identity) return errorReply(errors.ACCESS_DENIED, "ACCESS_DENIED");
        const caller = authorizeMcpCaller(identity, relay.access);
        if (!caller.ok) return errorReply(errors[caller.error], caller.error);
        const result = disconnectMcpConnection(caller.value, database, relay);
        return result.ok ? successReply(result.value) : errorReply(errors[result.error], result.error);
      } catch {
        return errorReply(errors.CONNECTION_DISCONNECT_FAILED, "CONNECTION_DISCONNECT_FAILED");
      }
    }
  );
  return server;
}
