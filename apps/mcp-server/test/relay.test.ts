import assert from "node:assert/strict";
import { test } from "node:test";
import { authorizeMcpCaller, revokeAccess } from "../src/access/index.ts";
import { attachBrowserBridge, forwardFlexQuery, parseBridgeReply } from "../src/bridge/index.ts";
import type { BrowserConnection, RelayContext } from "../src/bridge/index.ts";
import { getServiceReadiness } from "../src/operations/index.ts";
import type { BridgeRequest } from "../../../shared/index.ts";

const binding = { ownerId: "example-owner", profileId: "example-profile" };
const query = { kind: "leave" } as const;
const exampleBalance = { days: 1, totalMinutes: 480, breakdown: { days: 1, hours: 0, minutes: 0 } };

function bridge(profile = binding) {
  const sent: BridgeRequest[] = [];
  let receive = (_value: unknown) => {};
  let disconnect = () => {};
  const connection: BrowserConnection = {
    ...profile,
    send: request => { sent.push(request); },
    close: () => disconnect(),
    onReply: handler => { receive = handler; },
    onClose: handler => { disconnect = handler; },
  };
  return { connection, sent, reply: (value: unknown) => receive(value) };
}

function setup(timeoutMs = 500, maxPending = 2) {
  const access = { binding, allowedCallers: new Set(["first-agent", "second-agent"]) };
  const relay: RelayContext = { access, registry: { active: new Map(), pending: new Map() }, timeoutMs, maxPending };
  const first = authorizeMcpCaller({ callerId: "first-agent" }, access);
  const second = authorizeMcpCaller({ callerId: "second-agent" }, access);
  assert.ok(first.ok && second.ok);
  const channel = bridge();
  assert.ok(attachBrowserBridge(binding, channel.connection, relay.registry).ok);
  return { first: first.value, second: second.value, relay, channel };
}

test("두 에이전트의 역순 응답을 분리하고 대기 상한을 지킨다", async () => {
  const { first, second, relay, channel } = setup();
  const firstResult = forwardFlexQuery(first, query, relay);
  const secondResult = forwardFlexQuery(second, query, relay);
  assert.deepEqual(await forwardFlexQuery(first, query, relay), { ok: false, error: "QUERY_LIMIT_REACHED" });
  assert.equal(channel.sent.length, 2);
  assert.notEqual(channel.sent[0].requestId, channel.sent[1].requestId);
  const result = { asOf: "2027-01-01T00:00:00Z", remaining: exampleBalance, usable: exampleBalance };
  channel.reply({ requestId: channel.sent[1].requestId, result });
  channel.reply({ requestId: channel.sent[1].requestId, error: "FLEX_NO_RECORDS" });
  channel.reply({ requestId: channel.sent[0].requestId, error: "FLEX_REAUTH_REQUIRED" });
  assert.deepEqual(await firstResult, { ok: false, error: "FLEX_REAUTH_REQUIRED" });
  assert.deepEqual(await secondResult, { ok: true, value: result });
  assert.equal(relay.registry.pending.size, 0);
});

test("연결 교체와 시간 초과를 구분하고 이전 연결의 응답을 무시한다", async () => {
  const { first, relay, channel } = setup(20);
  const pending = forwardFlexQuery(first, query, relay);
  const wrong = bridge({ ...binding, profileId: "other-profile" });
  assert.deepEqual(attachBrowserBridge(binding, wrong.connection, relay.registry), { ok: false, error: "ACCESS_DENIED" });
  const replacement = bridge();
  assert.ok(attachBrowserBridge(binding, replacement.connection, relay.registry).ok);
  assert.deepEqual(await pending, { ok: false, error: "BROWSER_OFFLINE" });
  const late = forwardFlexQuery(first, query, relay);
  const requestId = replacement.sent[0].requestId;
  channel.reply({ requestId, error: "FLEX_NO_RECORDS" });
  assert.deepEqual(await late, { ok: false, error: "QUERY_TIMEOUT" });
  replacement.reply({ requestId, error: "FLEX_NO_RECORDS" });
  assert.equal(relay.registry.pending.size, 0);
  replacement.connection.close();
  assert.deepEqual(await forwardFlexQuery(first, query, relay), { ok: false, error: "BROWSER_OFFLINE" });
});

test("권한 해제는 지정한 호출자와 프로필의 새 요청 및 대기 결과를 차단한다", async () => {
  const { first, second, relay, channel } = setup();
  const denied = { ok: false, error: "ACCESS_DENIED" };
  assert.deepEqual(authorizeMcpCaller(null, relay.access), { ok: false, error: "CALLER_UNVERIFIED" });
  const firstResult = forwardFlexQuery(first, query, relay);
  const secondResult = forwardFlexQuery(second, query, relay);
  const caller = { kind: "caller", callerId: first.callerId } as const;
  assert.deepEqual(revokeAccess({ ownerId: "other-owner" }, caller, relay.access, relay.registry), denied);
  assert.equal(relay.registry.pending.size, 2);
  assert.ok(revokeAccess(binding, caller, relay.access, relay.registry).ok);
  channel.reply({ requestId: channel.sent[0].requestId, error: "FLEX_NO_RECORDS" });
  assert.deepEqual(await firstResult, denied);
  assert.deepEqual(await forwardFlexQuery(first, query, relay), denied);
  assert.equal(relay.registry.pending.size, 1);
  assert.ok(revokeAccess(binding, { kind: "profile", profileId: binding.profileId }, relay.access, relay.registry).ok);
  assert.deepEqual(await secondResult, denied);
  assert.deepEqual(await forwardFlexQuery(second, query, relay), denied);
  assert.equal(relay.registry.active.size, 0);
});

test("중계 응답은 다른 조회의 결과와 추가 필드를 거부한다", () => {
  const reply = { requestId: "example-request", result: {
    asOf: "2027-01-01T00:00:00Z", remaining: exampleBalance, usable: exampleBalance,
  } };
  const invalid = { ok: false, error: "INVALID_BRIDGE_MESSAGE" };
  assert.deepEqual(parseBridgeReply(reply, query), { ok: true, value: reply });
  assert.deepEqual(parseBridgeReply(reply, { kind: "schedule", range: { from: "2027-01-01", to: "2027-01-02" } }), invalid);
  assert.deepEqual(parseBridgeReply({ ...reply, result: { ...reply.result, userRef: "example" } }, query), invalid);
  assert.deepEqual(parseBridgeReply({ requestId: "example-request", error: "ACCESS_DENIED" }, query), invalid);
});

test("서버 준비 상태와 브라우저 연결 상태를 각각 판정한다", () => {
  assert.deepEqual(getServiceReadiness({ configured: true, paused: false, browserOnline: false }),
    { acceptsRequests: true, browserOnline: false });
  assert.deepEqual(getServiceReadiness({ configured: true, paused: true, browserOnline: true }),
    { acceptsRequests: false, browserOnline: true });
  assert.deepEqual(getServiceReadiness({ configured: false, paused: false, browserOnline: true }),
    { acceptsRequests: false, browserOnline: true });
});
