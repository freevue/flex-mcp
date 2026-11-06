import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { WebSocket } from "ws";
import { isRecord } from "../../../shared/index.ts";
import { createSyntheticReply, parseBridgeRequest } from "../../chrome-extension/src/bridge/index.ts";
import { issueAgentKey, openStateDatabase } from "../src/registration/index.ts";
import { createRemoteServer } from "../src/remote/index.ts";

test("두 사용자가 같은 주소에서 조회하고 다른 사용자의 소켓으로 전환하지 않는다", { timeout: 8_000 }, async context => {
  const database = openStateDatabase(":memory:");
  const extension = "chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const server = createRemoteServer({ origin: "https://example.invalid", extensionOrigins: new Set([extension]) }, database);
  const sockets: WebSocket[] = [];
  const clients: Client[] = [];
  context.after(async () => {
    for (const socket of sockets) socket.terminate();
    await Promise.all(clients.map(client => client.close()));
    await new Promise<void>(resolve => server.close(() => resolve()));
    database.close();
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const { port } = address;
  const origin = `http://127.0.0.1:${port}`;

  async function connectAgent(ownerId: string, canApprove: boolean) {
    const { key } = issueAgentKey(database, ownerId, canApprove);
    const client = new Client({ name: ownerId, version: "0.1.0" });
    clients.push(client);
    await client.connect(new StreamableHTTPClientTransport(new URL("/mcp", origin), {
      requestInit: { headers: { Authorization: `Bearer ${key}` } },
    }));
    return client;
  }

  async function setup(ownerId: string) {
    const client = await connectAgent(ownerId, true);
    const readOnly = await connectAgent(ownerId, false);
    const started = await fetch(`${origin}/bridge/pair/start`, { method: "POST", headers: { Origin: extension } });
    assert.equal(started.status, 201);
    const { approvalCode, requestKey } = await started.json() as { approvalCode: string; requestKey: string };
    const claim = async (proof: string) => (await fetch(`${origin}/bridge/pair/claim`, {
      method: "POST", headers: { Origin: extension, Authorization: `Bearer ${proof}` },
    })).json();
    assert.deepEqual(await claim(requestKey), { status: "pending" });
    const approval = { name: "flex_approve_connection", arguments: { approvalCode } };
    assert.equal((await readOnly.callTool(approval)).isError, true);
    assert.deepEqual(await claim(requestKey), { status: "pending" });
    assert.deepEqual((await client.callTool(approval)).structuredContent, { status: "approved" });
    assert.deepEqual(await socketStatus(client), { status: "unregistered" });
    assert.equal((await client.callTool(approval)).isError, true);
    assert.deepEqual(await claim(approvalCode), { status: "unavailable" });
    const paired = await claim(requestKey) as { status: string; registration: { bindingId: string; deviceKey: string } };
    assert.equal(paired.status, "registered");
    assert.deepEqual(await claim(requestKey), { status: "unavailable" });
    const { registration } = paired;
    const issued = await fetch(`${origin}/bridge/ticket`, {
      method: "POST", headers: { Origin: extension, Authorization: `Bearer ${registration.deviceKey}` },
    });
    assert.equal(issued.status, 200);
    const { ticket } = await issued.json() as { ticket: string };
    const socket = new WebSocket(`ws://127.0.0.1:${port}/bridge`, { origin: extension });
    sockets.push(socket);
    await once(socket, "open");
    const ready = once(socket, "message");
    socket.send(JSON.stringify({ type: "auth", ticket }));
    const [acknowledgement] = await ready;
    assert.equal(String(acknowledgement), '{"type":"ready"}');
    socket.on("message", data => {
      const parsed = parseBridgeRequest(JSON.parse(String(data)) as unknown);
      if (parsed.ok) socket.send(JSON.stringify(createSyntheticReply(parsed.value, registration.bindingId)));
    });
    return { client, socket, registration };
  }

  async function query(client: Client) {
    return client.callTool({ name: "flex_get_schedule", arguments: { from: "2027-01-01", to: "2027-01-01" } });
  }

  async function socketStatus(client: Client) {
    const result = await client.callTool({ name: "flex_get_socket_status" });
    assert.notEqual(result.isError, true);
    return result.structuredContent;
  }

  assert.equal((await fetch(`${origin}/bridge/pair/start`, { method: "POST" })).status, 403);
  const first = await setup("sample-alpha");
  const second = await setup("sample-beta");
  assert.deepEqual(await socketStatus(first.client), { status: "online" });
  const foreignStatus = await first.client.callTool({
    name: "flex_get_socket_status", arguments: { bindingId: second.registration.bindingId },
  });
  assert.equal(foreignStatus.isError, true);
  const [firstResult, secondResult] = await Promise.all([query(first.client), query(second.client)]);
  for (const [result, entry] of [[firstResult, first], [secondResult, second]] as const) {
    assert.ok(isRecord(result.structuredContent));
    assert.equal(result.structuredContent.synthetic, true);
    assert.match(JSON.stringify(result.structuredContent), new RegExp(entry.registration.bindingId.slice(0, 8)));
  }
  assert.notEqual(first.registration.bindingId, second.registration.bindingId);
  const closed = once(first.socket, "close");
  first.socket.close();
  await closed;
  assert.deepEqual(await socketStatus(first.client), { status: "offline" });
  assert.deepEqual(await socketStatus(second.client), { status: "online" });
  assert.deepEqual((await query(first.client)).structuredContent, { code: "BROWSER_OFFLINE" });
  const remaining = (await query(second.client)).structuredContent;
  assert.ok(isRecord(remaining));
  assert.equal(remaining.synthetic, true);
  const unpaired = await fetch(`${origin}/bridge/unpair`, {
    method: "POST", headers: { Origin: extension, Authorization: `Bearer ${second.registration.deviceKey}` },
  });
  assert.equal(unpaired.status, 204);
  assert.deepEqual(await socketStatus(second.client), { status: "unregistered" });
  assert.deepEqual((await query(second.client)).structuredContent, { code: "ACCESS_DENIED" });
  assert.equal((await fetch(`${origin}/mcp`)).status, 401);
  assert.equal((await fetch(`${origin}/mcp`, { headers: { Origin: "https://other.invalid" } })).status, 403);
});
