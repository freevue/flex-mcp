import assert from "node:assert/strict";
import { once } from "node:events";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { WebSocket } from "ws";
import { isRecord } from "../../../shared/index.ts";
import { createSyntheticReply, parseBridgeRequest } from "../../chrome-extension/src/bridge/index.ts";

export async function checkPairedChannels(origin: string): Promise<void> {
  const extension = "chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const sockets: WebSocket[] = [];
  const deviceKeys = new Set<string>();
  const client = new Client({ name: "flex-channel-check", version: "1" });
  const post = (path: string, key?: string, requestOrigin = extension) => fetch(new URL(path, origin), {
    method: "POST",
    headers: { Origin: requestOrigin, ...(key ? { Authorization: `Bearer ${key}` } : {}) },
    signal: AbortSignal.timeout(10_000),
  });
  const status = (connectionKey: string) =>
    client.callTool({ name: "flex_get_socket_status", arguments: { connectionKey } });
  const query = (connectionKey: string) =>
    client.callTool({ name: "flex_get_schedule", arguments: { connectionKey } });

  async function pair(reportsFlexSource = false) {
    const started = await post("/bridge/pair/start");
    assert.equal(started.status, 201);
    const { approvalCode, requestKey } = await started.json() as { approvalCode: string; requestKey: string };
    const claim = async (proof: string) => (await post("/bridge/pair/claim", proof)).json();
    assert.deepEqual(await claim(requestKey), { status: "pending" });
    const approval = { name: "flex_approve_connection", arguments: { approvalCode } };
    const approved = (await client.callTool(approval)).structuredContent;
    assert.ok(isRecord(approved) && approved.status === "approved" && typeof approved.connectionKey === "string");
    const { connectionKey } = approved;
    assert.equal((await client.callTool(approval)).isError, true);
    assert.equal((await status(connectionKey)).isError, true);
    assert.deepEqual(await claim(connectionKey), { status: "unavailable" });
    const paired = await claim(requestKey) as { status: string; registration: { bindingId: string; deviceKey: string } };
    assert.equal(paired.status, "registered");
    const { bindingId, deviceKey } = paired.registration;
    deviceKeys.add(deviceKey);
    assert.deepEqual(await claim(requestKey), { status: "unavailable" });
    assert.deepEqual((await status(connectionKey)).structuredContent, { status: "offline" });

    const issued = await post("/bridge/ticket", deviceKey);
    assert.equal(issued.status, 200);
    const { ticket } = await issued.json() as { ticket: string };
    const url = new URL("/bridge", origin);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(url, { origin: extension, handshakeTimeout: 8_000 });
    sockets.push(socket);
    await once(socket, "open");
    const ready = once(socket, "message", { signal: AbortSignal.timeout(8_000) });
    socket.send(JSON.stringify({ type: "auth", ticket }));
    assert.equal(String((await ready)[0]), '{"type":"ready"}');
    socket.on("message", data => {
      const parsed = parseBridgeRequest(JSON.parse(String(data)) as unknown);
      if (!parsed.ok) return;
      const reply = createSyntheticReply(parsed.value, bindingId);
      socket.send(JSON.stringify(reportsFlexSource && "result" in reply ? { ...reply, source: "flex" } : reply));
    });
    return { bindingId, connectionKey, deviceKey, reportsFlexSource };
  }

  try {
    assert.equal((await post("/bridge/pair/start", undefined, "https://other.invalid")).status, 403);
    await client.connect(new StreamableHTTPClientTransport(new URL("/mcp", origin)));
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map(tool => tool.name).sort(), [
      "flex_approve_connection", "flex_get_annual_leave", "flex_get_schedule", "flex_get_socket_status", "flex_get_work_hours",
    ]);
    assert.equal((await client.callTool({ name: "flex_get_socket_status" })).isError, true);
    const first = await pair();
    const second = await pair(true);
    assert.notEqual(first.bindingId, second.bindingId);
    assert.equal((await client.callTool({ name: "flex_get_socket_status",
      arguments: { connectionKey: first.connectionKey, bindingId: second.bindingId } })).isError, true);
    for (const channel of [first, second]) {
      assert.deepEqual((await status(channel.connectionKey)).structuredContent, { status: "online" });
      const result = (await query(channel.connectionKey)).structuredContent;
      assert.ok(isRecord(result));
      assert.equal(result.synthetic, channel.reportsFlexSource ? undefined : true);
      assert.equal(Object.hasOwn(result, "source"), false);
      assert.ok(JSON.stringify(result).includes(channel.bindingId.slice(0, 8)));
    }
    assert.equal((await post("/bridge/unpair", first.deviceKey)).status, 204);
    deviceKeys.delete(first.deviceKey);
    assert.deepEqual((await query(first.connectionKey)).structuredContent, { code: "ACCESS_DENIED" });
    assert.deepEqual((await status(second.connectionKey)).structuredContent, { status: "online" });
  } finally {
    for (const socket of sockets) socket.terminate();
    await client.close();
    for (const deviceKey of deviceKeys) {
      assert.equal((await post("/bridge/unpair", deviceKey)).status, 204);
    }
  }
}
