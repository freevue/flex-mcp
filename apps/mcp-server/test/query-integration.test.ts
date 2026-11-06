import assert from "node:assert/strict";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { dispatchToFlexTab, parseBridgeRequest } from "../../chrome-extension/src/bridge/index.ts";
import { runFlexQuery } from "../../chrome-extension/src/flex/index.ts";
import type { FlexPageContext } from "../../chrome-extension/src/flex/index.ts";
import { attachBrowserBridge } from "../src/bridge/index.ts";
import type { RelayContext } from "../src/bridge/index.ts";
import { createCallerMcpServer } from "../src/createCallerMcpServer.ts";

import { createTestAccess } from "./accessFixture.ts";

test("MCP 도구부터 합성 Chrome 조회까지 세 결과와 권한 경계를 확인한다", async context => {
  const binding = { ownerId: "example-owner", bindingId: "example-profile" };
  const access = createTestAccess(binding, ["approved-agent"]);
  const relay: RelayContext = { access, registry: { active: new Map(), pending: new Map() }, timeoutMs: 200, maxPending: 2 };
  const tab = { id: 1, url: "https://flex.team/" };
  const user = { userRef: "example-user" };
  const now = () => new Date("2026-12-31T15:00:00Z");
  const zero = { days: 0, totalMinutes: 0, breakdown: { days: 0, hours: 0, minutes: 0 } };
  const reads: string[] = [];
  const page: FlexPageContext = {
    origin: "https://flex.team",
    now,
    read: async request => {
      reads.push(request.kind);
      const value = {
        currentUser: user,
        annualLeave: { remaining: { ...zero, days: 1 }, usable: zero },
        primaryCalendar: { primary: true, ownerRef: user.userRef, calendarRef: "example-calendar" },
        calendarEvents: { complete: true, events: [] },
        recurringCalendarEvents: { complete: true, events: [] },
        workHours: { actualMinutes: 0, recognizedMinutes: 1, requiredAgreedMinutes: 2, overtimeMinutes: 3, timeOffMinutes: 4 },
      };
      return { kind: "response", value: value[request.kind] };
    },
  };
  let receiveReply = (_value: unknown) => {};
  assert.ok(attachBrowserBridge(binding, {
    ...binding,
    send: request => {
      const parsed = parseBridgeRequest(JSON.parse(JSON.stringify(request)) as unknown);
      assert.ok(parsed.ok);
      void dispatchToFlexTab(tab, parsed.value, new AbortController().signal, {
        getDocument: async () => ({ id: "same-document", url: tab.url }),
        execute: (_tabId, _documentId, query, signal) => runFlexQuery(page, query, { ...binding, ...user }, signal),
      }).then(value => receiveReply(JSON.parse(JSON.stringify(value)) as unknown));
    },
    onReply: handler => { receiveReply = handler; },
    onClose: () => {},
    close: () => {},
  }, relay.registry).ok);

  async function connect(callerId: string) {
    const server = createCallerMcpServer({ callerId, ownerId: binding.ownerId }, relay, now);
    const client = new Client({ name: callerId, version: "0.1.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    context.after(() => client.close());
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    return client;
  }

  const denied = await connect("denied-agent");
  assert.deepEqual((await denied.callTool({ name: "flex_get_annual_leave" })).structuredContent, { code: "ACCESS_DENIED" });
  assert.deepEqual(reads, []);

  const client = await connect("approved-agent");
  const annual = await client.callTool({ name: "flex_get_annual_leave" });
  assert.deepEqual(annual.structuredContent, { asOf: now().toISOString(), remaining: { ...zero, days: 1 }, usable: zero });
  const schedule = await client.callTool({ name: "flex_get_schedule" });
  assert.deepEqual(schedule.structuredContent, { from: "2027-01-01", to: "2027-01-07", timezone: "Asia/Seoul", events: [] });
  const work = await client.callTool({ name: "flex_get_work_hours" });
  assert.deepEqual(work.structuredContent, { from: "2027-01-01", to: "2027-01-01", timezone: "Asia/Seoul",
    actualMinutes: 0, recognizedMinutes: 1, requiredAgreedMinutes: 2, overtimeMinutes: 3, timeOffMinutes: 4 });
  const readCount = reads.length;
  const invalid = await client.callTool({ name: "flex_get_schedule", arguments: { from: "2027-01-01", to: "2027-02-01" } });
  assert.equal(invalid.isError, true);
  assert.equal(reads.length, readCount);
});
