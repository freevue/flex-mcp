import assert from "node:assert/strict";
import { once } from "node:events";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { WebSocket } from "ws";
import { isRecord } from "../../../shared/index.ts";

type Connection = { bindingId: string; connectionKey: string; deviceKey: string; socket: WebSocket };
type Post = (path: string, key?: string) => Promise<Response>;

export async function checkMcpDisconnection(
  client: Client,
  current: Connection,
  remainingKey: string,
  other: Connection,
  post: Post,
  deviceKeys: Set<string>
): Promise<void> {
  const disconnect = (connectionKey: string) => client.callTool({ name: "flex_disconnect_connection", arguments: { connectionKey } });
  const query = (connectionKey: string) => client.callTool({ name: "flex_get_schedule", arguments: { connectionKey } });
  const approve = (approvalCode: string) => client.callTool({ name: "flex_approve_connection", arguments: { approvalCode } });
  async function issue(path: string) {
    const response = await post(path, current.deviceKey);
    assert.equal(response.status, 201);
    const payload: unknown = await response.json();
    assert.ok(isRecord(payload) && typeof payload.approvalCode === "string");
    return payload.approvalCode;
  }

  const denied = { code: "ACCESS_DENIED" };
  const unknown = await disconnect("a".repeat(43));
  assert.equal(unknown.isError, true, "FT-FLEX-DISCONNECT-01");
  assert.deepEqual(unknown.structuredContent, denied);
  assert.equal(
    (
      await client.callTool({
        name: "flex_disconnect_connection",
        arguments: { connectionKey: current.connectionKey, bindingId: other.bindingId }
      })
    ).isError,
    true,
    "FT-FLEX-DISCONNECT-01"
  );

  const retained = await disconnect(current.connectionKey);
  assert.equal(retained.isError, undefined);
  assert.deepEqual(retained.structuredContent, { status: "disconnected", chromeRegistration: "preserved" }, "FT-FLEX-DISCONNECT-02");
  assert.deepEqual((await query(current.connectionKey)).structuredContent, denied);
  assert.deepEqual((await disconnect(current.connectionKey)).structuredContent, denied);
  assert.equal(current.socket.readyState, WebSocket.OPEN);
  assert.equal((await query(remainingKey)).isError, undefined);

  const pendingInvitation = await issue("/bridge/pair/invite");
  const closed = once(current.socket, "close", { signal: AbortSignal.timeout(8_000) });
  void closed.catch(() => {});
  const removed = await disconnect(remainingKey);
  if (!removed.isError) deviceKeys.delete(current.deviceKey);
  assert.deepEqual(removed.structuredContent, { status: "disconnected", chromeRegistration: "removed" }, "FT-FLEX-DISCONNECT-03");
  await closed;
  assert.deepEqual((await query(remainingKey)).structuredContent, denied);
  assert.equal((await post("/bridge/ticket", current.deviceKey)).status, 401);
  assert.equal((await approve(pendingInvitation)).isError, true);
  assert.equal((await query(other.connectionKey)).isError, undefined);
}
