import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { resolveRange, seoulDate, shiftDate } from "../src/dates.ts";

test("한국 날짜와 포함 기준 31일 범위를 확인한다", () => {
  assert.equal(seoulDate(new Date("2026-12-31T15:00:00Z")), "2027-01-01");
  assert.equal(shiftDate("2026-12-31", 1), "2027-01-01");
  const range = { from: "2027-01-01", to: "2027-01-31" };
  assert.deepEqual(resolveRange(range, range), range);
  assert.throws(() => resolveRange({ ...range, to: "2027-02-01" }, range), /최대 31일/);
});

test("공개 서버는 조회를 차단하고 임의 조회 대상을 거부한다", async context => {
  const client = new Client({ name: "flex-public-test", version: "0.1.0" });
  context.after(() => client.close());
  await client.connect(new StdioClientTransport({
    command: process.execPath,
    args: [fileURLToPath(new URL("../src/index.ts", import.meta.url))],
  }));
  const { tools } = await client.listTools();
  assert.equal(tools.length, 3);
  for (const tool of tools) {
    const result = await client.callTool({ name: tool.name, arguments: {} });
    assert.equal(result.isError, true);
    assert.deepEqual(result.content, [{ type: "text", text: "조회 연결이 구성되지 않았습니다." }]);
    assert.equal(result.structuredContent, undefined);
  }

  const invalid = await client.callTool({ name: "flex_get_annual_leave", arguments: { userId: "synthetic" } });
  assert.equal(invalid.isError, true);
  assert.notDeepEqual(invalid.content, [{ type: "text", text: "조회 연결이 구성되지 않았습니다." }]);
  const incomplete = await client.callTool({ name: "flex_get_work_hours", arguments: { from: "2027-01-01" } });
  assert.equal(incomplete.isError, true);
  assert.deepEqual(incomplete.content, [{ type: "text", text: "시작일과 종료일을 함께 지정하세요." }]);
});
