import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { once } from "node:events";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { WebSocket } from "ws";
import { isRecord } from "../../../shared/index.ts";
import { createSyntheticReply, parseBridgeRequest } from "../../chrome-extension/src/bridge/index.ts";

test("로컬 Workers에서 승인 권한을 구분하고 두 사용자의 소켓과 조회를 분리한다", { timeout: 25_000 }, async context => {
  const root = fileURLToPath(new URL("../../../", import.meta.url));
  const local = join(root, ".local");
  mkdirSync(local, { recursive: true });
  const folder = mkdtempSync(join(local, "worker-test-"));
  const users = [
    { callerId: "agent-alpha", ownerId: "sample-alpha", canApprove: true },
    { callerId: "agent-beta", ownerId: "sample-beta", canApprove: true },
    { callerId: "agent-readonly", ownerId: "sample-alpha", canApprove: false },
  ];
  const keys = users.map(() => randomBytes(32).toString("base64url"));
  const agents = users.map((entry, index) => ({ ...entry, keyDigest: createHash("sha256").update(keys[index]).digest("hex") }));
  const id = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const extension = `chrome-extension://${id}`;
  const vars = join(folder, "vars");
  writeFileSync(vars, `FLEX_EXTENSION_IDS=${id}\nFLEX_WORKER_AGENTS='${JSON.stringify(agents)}'\n`, { mode: 0o600 });

  const reservation = createServer().listen(0, "127.0.0.1");
  await once(reservation, "listening");
  const address = reservation.address();
  assert.ok(address && typeof address !== "string");
  const { port } = address;
  await new Promise<void>(resolve => reservation.close(() => resolve()));
  const origin = `http://127.0.0.1:${port}`;
  const worker = spawn(process.execPath, [join(root, "node_modules/wrangler/bin/wrangler.js"), "dev", "--env", "staging",
    "--ip", "127.0.0.1", "--port", String(port), "--env-file", vars, "--persist-to", join(folder, "state")], {
    cwd: root, env: { ...process.env, WRANGLER_SEND_METRICS: "false" }, stdio: ["ignore", "pipe", "pipe"],
  });
  const exited = once(worker, "exit");
  let diagnostics = "";
  const keepDiagnostics = (data: Buffer) => { diagnostics = `${diagnostics}${data.toString("utf8")}`.slice(-2_000); };
  worker.stdout.on("data", keepDiagnostics);
  worker.stderr.on("data", keepDiagnostics);
  const sockets: WebSocket[] = [];
  const clients: Client[] = [];
  context.after(async () => {
    for (const socket of sockets) socket.terminate();
    await Promise.all(clients.map(client => client.close()));
    worker.kill("SIGTERM");
    await Promise.race([exited, delay(1_500)]);
    rmSync(folder, { recursive: true, force: true });
  });
  let live = false;
  for (let attempt = 0; attempt < 50 && worker.exitCode === null; attempt++) {
    live = (await fetch(`${origin}/mcp`).catch(() => null))?.status === 401;
    if (live) break;
    await delay(100);
  }
  assert.ok(live, diagnostics);
  const post = (path: string, key?: string, requestOrigin = extension) => fetch(`${origin}${path}`, {
    method: "POST", headers: { Origin: requestOrigin, ...(key ? { Authorization: `Bearer ${key}` } : {}) },
  });
  assert.equal((await post("/bridge/pair/start", undefined, "https://other.invalid")).status, 403);
  const [first, second, readOnly] = await Promise.all(keys.map(async key => {
    const client = new Client({ name: "worker-smoke", version: "1" });
    clients.push(client);
    await client.connect(new StreamableHTTPClientTransport(new URL("/mcp", origin), {
      requestInit: { headers: { Authorization: `Bearer ${key}` } },
    }));
    return client;
  }));
  const status = async (client: Client) => {
    const { structuredContent } = await client.callTool({ name: "flex_get_socket_status" });
    return isRecord(structuredContent) ? structuredContent.status : undefined;
  };
  async function pair(client: Client, checkReadOnly = false) {
    const start = await post("/bridge/pair/start");
    assert.equal(start.status, 201);
    const { approvalCode, requestKey } = await start.json() as { approvalCode: string; requestKey: string };
    assert.deepEqual(await (await post("/bridge/pair/claim", requestKey)).json(), { status: "pending" });
    const approval = { name: "flex_approve_connection", arguments: { approvalCode } };
    if (checkReadOnly) assert.equal((await readOnly.callTool(approval)).isError, true);
    assert.deepEqual((await client.callTool(approval)).structuredContent, { status: "approved" });
    assert.equal(await status(client), "unregistered");
    const claim = await (await post("/bridge/pair/claim", requestKey)).json() as {
      status: string; registration: { bindingId: string; deviceKey: string };
    };
    assert.equal(claim.status, "registered");
    assert.deepEqual(await (await post("/bridge/pair/claim", requestKey)).json(), { status: "unavailable" });
    const { bindingId, deviceKey } = claim.registration;
    const ticketResponse = await post("/bridge/ticket", deviceKey);
    assert.equal(ticketResponse.status, 200);
    const { ticket } = await ticketResponse.json() as { ticket: string };
    const socket = new WebSocket(`ws://127.0.0.1:${port}/bridge`, { origin: extension });
    sockets.push(socket);
    await once(socket, "open");
    const ready = once(socket, "message");
    socket.send(JSON.stringify({ type: "auth", ticket }));
    assert.equal(String((await ready)[0]), '{"type":"ready"}');
    socket.on("message", data => {
      const parsed = parseBridgeRequest(JSON.parse(String(data)) as unknown);
      if (parsed.ok) socket.send(JSON.stringify(createSyntheticReply(parsed.value, bindingId)));
    });
    return { bindingId, deviceKey };
  }

  const firstRegistration = await pair(first, true);
  const secondRegistration = await pair(second);
  const results = await Promise.all([first, second].map(client => client.callTool({ name: "flex_get_schedule" })));
  const expected = [firstRegistration.bindingId, secondRegistration.bindingId];
  for (const [index, result] of results.entries()) {
    assert.ok(isRecord(result.structuredContent));
    assert.equal(result.structuredContent.synthetic, true);
    assert.ok(JSON.stringify(result.structuredContent).includes(expected[index].slice(0, 8)));
  }
  assert.equal(await status(first), "online");
  assert.equal((await post("/bridge/unpair", firstRegistration.deviceKey)).status, 204);
  assert.equal(await status(first), "unregistered");
  assert.equal(await status(second), "online");
});
