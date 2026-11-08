import assert from "node:assert/strict";
import { once } from "node:events";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { WebSocket } from "ws";
import { isRecord } from "../../../shared/index.ts";
import { createSyntheticReply, parseBridgeRequest } from "../../chrome-extension/src/bridge/index.ts";
import { checkMcpDisconnection } from "./checkMcpDisconnection.ts";
import { checkPairedHolidays, checkPairedWorkStatus, checkSummaryResponse } from "./checkWorkToolResults.ts";

export async function checkPairedChannels(origin: string): Promise<void> {
  const extension = "chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const sockets: WebSocket[] = [];
  const deviceKeys = new Set<string>();
  const client = new Client({ name: "flex-channel-check", version: "1" });
  const additionalClient = new Client({ name: "flex-additional-client", version: "1" });
  const post = (path: string, key?: string, requestOrigin = extension) =>
    fetch(new URL(path, origin), {
      method: "POST",
      headers: { Origin: requestOrigin, ...(key ? { Authorization: `Bearer ${key}` } : {}) },
      signal: AbortSignal.timeout(10_000)
    });
  const status = (connectionKey: string) => client.callTool({ name: "flex_get_socket_status", arguments: { connectionKey } });
  const query = (connectionKey: string) => client.callTool({ name: "flex_get_schedule", arguments: { connectionKey } });
  const summary = async (connectionKey?: string) =>
    CallToolResultSchema.parse(await client.callTool({ name: "flex_get_work_summary", arguments: connectionKey ? { connectionKey } : {} }));

  async function pair(reportsFlexSource = false) {
    const started = await post("/bridge/pair/start");
    assert.equal(started.status, 201);
    const { approvalCode, requestKey } = (await started.json()) as { approvalCode: string; requestKey: string };
    const claim = async (proof: string) => (await post("/bridge/pair/claim", proof)).json();
    assert.deepEqual(await claim(requestKey), { status: "pending" });
    const approval = { name: "flex_approve_connection", arguments: { approvalCode } };
    const approved = (await client.callTool(approval)).structuredContent;
    assert.ok(isRecord(approved) && approved.status === "approved" && typeof approved.connectionKey === "string");
    const { connectionKey } = approved;
    assert.equal((await client.callTool(approval)).isError, true);
    assert.equal((await status(connectionKey)).isError, true);
    assert.deepEqual(await claim(connectionKey), { status: "unavailable" });
    const paired = (await claim(requestKey)) as { status: string; registration: { bindingId: string; deviceKey: string } };
    assert.equal(paired.status, "registered");
    const { bindingId, deviceKey } = paired.registration;
    deviceKeys.add(deviceKey);
    assert.deepEqual(await claim(requestKey), { status: "unavailable" });
    assert.deepEqual((await status(connectionKey)).structuredContent, { status: "offline" });
    const offline = await summary(connectionKey);
    assert.deepEqual(offline.structuredContent, { code: "BROWSER_OFFLINE" });
    assert.equal(offline.content.length, 1, "FT-MCP-WORK-DISPLAY-03");

    const issued = await post("/bridge/ticket", deviceKey);
    assert.equal(issued.status, 200);
    const { ticket } = (await issued.json()) as { ticket: string };
    const url = new URL("/bridge", origin);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(url, { origin: extension, handshakeTimeout: 8_000 });
    sockets.push(socket);
    await once(socket, "open");
    const ready = once(socket, "message", { signal: AbortSignal.timeout(8_000) });
    socket.send(JSON.stringify({ type: "auth", ticket }));
    assert.equal(String((await ready)[0]), '{"type":"ready"}');
    socket.on("message", async (data) => {
      const parsed = parseBridgeRequest(JSON.parse(String(data)) as unknown);
      if (!parsed.ok) return;
      if (reportsFlexSource && parsed.value.query.kind === "workStatus") {
        socket.send(JSON.stringify({ requestId: parsed.value.requestId, result: { status: "working", details: "extra" }, source: "flex" }));
        return;
      }
      const reply = await createSyntheticReply(parsed.value, bindingId, AbortSignal.timeout(3_000));
      socket.send(JSON.stringify(reportsFlexSource && "result" in reply ? { ...reply, source: "flex" } : reply));
    });
    return { bindingId, connectionKey, deviceKey, reportsFlexSource, socket };
  }

  try {
    assert.equal((await post("/bridge/pair/start", undefined, "https://other.invalid")).status, 403);
    await client.connect(new StreamableHTTPClientTransport(new URL("/mcp", origin)));
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map((tool) => tool.name).sort(), [
      "flex_approve_connection",
      "flex_disconnect_connection",
      "flex_get_annual_leave",
      "flex_get_company_holidays",
      "flex_get_schedule",
      "flex_get_socket_status",
      "flex_get_work_hours",
      "flex_get_work_status",
      "flex_get_work_summary"
    ]);
    assert.equal((await client.callTool({ name: "flex_get_socket_status" })).isError, true);
    assert.equal((await summary()).isError, true);
    const denied = await summary("a".repeat(43));
    assert.deepEqual(denied.structuredContent, { code: "ACCESS_DENIED" });
    assert.equal(denied.content.length, 1, "FT-MCP-WORK-DISPLAY-03");
    const first = await pair();
    const second = await pair(true);
    assert.notEqual(first.bindingId, second.bindingId);
    await checkPairedHolidays(client, first.connectionKey);
    await checkPairedWorkStatus(client, first.connectionKey, second.connectionKey);
    assert.equal(
      (await client.callTool({ name: "flex_get_socket_status", arguments: { connectionKey: first.connectionKey, bindingId: second.bindingId } })).isError,
      true
    );
    for (const channel of [first, second]) {
      assert.deepEqual((await status(channel.connectionKey)).structuredContent, { status: "online" });
      const schedule = await query(channel.connectionKey);
      const result = schedule.structuredContent;
      assert.ok(isRecord(result));
      assert.deepEqual(schedule.content, [{ type: "text", text: JSON.stringify(result) }], "FT-MCP-WORK-DISPLAY-04");
      assert.equal(result.synthetic, channel.reportsFlexSource ? undefined : true);
      assert.equal(Object.hasOwn(result, "source"), false);
      assert.ok(JSON.stringify(result).includes(channel.bindingId.slice(0, 8)));
      checkSummaryResponse(await summary(channel.connectionKey), channel.reportsFlexSource);
    }
    assert.equal((await post("/bridge/pair/invite", first.connectionKey)).status, 401);
    await additionalClient.connect(new StreamableHTTPClientTransport(new URL("/mcp", origin)));
    const invitation = await post("/bridge/pair/invite", first.deviceKey);
    assert.equal(invitation.status, 201);
    const { approvalCode, requestKey } = (await invitation.json()) as { approvalCode: string; requestKey: string };
    const claimInvitation = async (key: string) => (await post("/bridge/pair/claim", key)).json();
    assert.deepEqual(await claimInvitation(requestKey), { status: "pending" });
    const approval = { name: "flex_approve_connection", arguments: { approvalCode } };
    const invited = (await additionalClient.callTool(approval)).structuredContent;
    assert.ok(isRecord(invited) && typeof invited.connectionKey === "string" && invited.connectionKey !== first.connectionKey);
    assert.equal((await additionalClient.callTool(approval)).isError, true);
    const addedQuery = () => additionalClient.callTool({ name: "flex_get_schedule", arguments: { connectionKey: invited.connectionKey } });
    assert.deepEqual((await addedQuery()).structuredContent, (await query(first.connectionKey)).structuredContent);
    assert.deepEqual(await claimInvitation(invited.connectionKey), { status: "unavailable" });
    assert.deepEqual(await claimInvitation(requestKey), { status: "linked" });
    assert.deepEqual(await claimInvitation(requestKey), { status: "unavailable" });
    assert.deepEqual((await status(first.connectionKey)).structuredContent, { status: "online" });
    await checkMcpDisconnection(client, first, invited.connectionKey, second, post, deviceKeys);
    const revoked = await summary(first.connectionKey);
    assert.deepEqual(revoked.structuredContent, { code: "ACCESS_DENIED" });
    assert.equal(revoked.content.length, 1, "FT-MCP-WORK-DISPLAY-03");
    assert.deepEqual((await status(second.connectionKey)).structuredContent, { status: "online" });
    assert.equal((await post("/bridge/unpair", second.deviceKey)).status, 204);
    deviceKeys.delete(second.deviceKey);
    assert.deepEqual((await query(second.connectionKey)).structuredContent, { code: "ACCESS_DENIED" });
  } finally {
    for (const socket of sockets) socket.terminate();
    await client.close();
    await additionalClient.close();
    for (const deviceKey of deviceKeys) {
      assert.equal((await post("/bridge/unpair", deviceKey)).status, 204);
    }
  }
}
