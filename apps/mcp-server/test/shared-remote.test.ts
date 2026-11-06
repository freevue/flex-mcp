import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import { openStateDatabase } from "../src/registration/index.ts";
import { createRemoteServer } from "../src/remote/index.ts";
import { checkPairedChannels } from "./checkPairedChannels.ts";

test("Node 원격 서버는 사전 등록 없이 확장 채널을 연결하고 조회 범위를 분리한다", { timeout: 15_000 }, async context => {
  const database = openStateDatabase(":memory:");
  const server = createRemoteServer({ origin: "https://example.invalid" }, database);
  context.after(async () => {
    await new Promise<void>(resolve => server.close(() => resolve()));
    database.close();
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const origin = `http://127.0.0.1:${address.port}`;
  assert.equal((await fetch(`${origin}/mcp`)).status, 405);
  assert.equal((await fetch(`${origin}/mcp`, { headers: { Origin: "https://other.invalid" } })).status, 403);
  await checkPairedChannels(origin);
});
