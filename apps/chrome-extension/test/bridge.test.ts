import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
import { test } from "node:test";
import { confirmBrowserBinding, connectBridge, deriveConnectionState, dispatchToFlexTab, findFlexTab,
  parseBridgeRequest } from "../src/bridge/index.ts";
import type { BridgeReply } from "../../../shared/index.ts";

const request = { requestId: "request-example", query: { kind: "leave" } } as const;
const tab = { id: 1, url: "https://flex.team/" };
const failure = (error: string) => ({ ok: false, error });
const unavailable = failure("FLEX_TAB_UNAVAILABLE");

test("요청은 날짜와 허용 필드만 받고 flex 탭을 임의로 바꾸지 않는다", () => {
  assert.deepEqual(parseBridgeRequest(request), { ok: true, value: request });
  for (const invalid of [{ ...request, userId: "example" }, { ...request, query: { ...request.query, url: "https://example.invalid" } },
    { ...request, query: { kind: "work", range: { from: "2027-02-29", to: "2027-03-01" } } },
    { ...request, query: { kind: "work", range: { from: "2027-01-01", to: "2027-02-01" } } }]) {
    assert.deepEqual(parseBridgeRequest(invalid), failure("INVALID_BRIDGE_MESSAGE"));
  }
  const other = { id: 2, url: "https://flex.team.example.invalid/" };
  assert.deepEqual(findFlexTab([tab, other]), { ok: true, value: tab });
  const second = { ...tab, id: 3 };
  assert.deepEqual(findFlexTab([tab, second]), unavailable);
  assert.deepEqual(findFlexTab([tab, second], 3), { ok: true, value: second });
  assert.deepEqual(findFlexTab([tab, other], 2), unavailable);
});

test("탭 문서가 교체되거나 신호가 중단되면 결과를 폐기한다", async () => {
  const signal = new AbortController();
  let documentId = "first";
  const runtime = {
    getDocument: async () => ({ id: documentId, url: tab.url }),
    execute: async () => {
      documentId = "second";
      return { ok: false, error: "FLEX_NO_RECORDS" } as const;
    },
  };
  assert.deepEqual(await dispatchToFlexTab(tab, request, signal.signal, runtime),
    { requestId: request.requestId, error: "FLEX_TAB_UNAVAILABLE" });
  assert.deepEqual(await dispatchToFlexTab(tab, request, signal.signal,
    { ...runtime, execute: async () => { signal.abort(); return { ok: false, error: "FLEX_NO_RECORDS" }; } }),
  { requestId: request.requestId, error: "FLEX_READ_FAILED" });
});

test("연결 확인과 상태 표시에서 계정 정보와 조회 결과를 분리한다", () => {
  const target = { bindingId: "example-profile" };
  const user = { ok: true, value: { userRef: "example-user" } } as const;
  assert.deepEqual(confirmBrowserBinding(false, target, user), failure("BINDING_CANCELLED"));
  assert.deepEqual(confirmBrowserBinding(true, target, user), { ok: true, value: { ...target, ...user.value } });
  assert.equal(deriveConnectionState({ bound: true, online: false, flex: "ready" }).status, "브라우저 오프라인");
  assert.equal(deriveConnectionState({ bound: true, online: true, flex: "unchecked" }).status, "서버 연결됨 · flex 상태 미확인");
  assert.equal(deriveConnectionState({ bound: true, online: true, flex: "FLEX_REAUTH_REQUIRED" }).status, "재로그인 필요");
  assert.equal(deriveConnectionState({ bound: true, online: true, flex: "FLEX_ACCOUNT_MISMATCH" }).status, "계정 불일치");
});

class FakeSocket extends EventTarget {
  sent: string[] = [];
  send(value: string) { this.sent.push(value); }
  close() { this.dispatchEvent(new Event("close")); }
  receive(value: unknown) { this.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(value) })); }
}

test("중계는 잘못된 메시지를 읽지 않고 재연결 뒤 이전 조회를 버린다", async context => {
  const sockets: FakeSocket[] = [];
  const connected = Promise.withResolvers<FakeSocket>();
  const pending = Promise.withResolvers<BridgeReply>();
  let querySignal: AbortSignal | undefined;
  const control = connectBridge({
    url: "wss://example.invalid/",
    retryDelayMs: 1,
    openSocket: () => {
      const socket = new FakeSocket();
      sockets.push(socket);
      if (sockets.length === 2) connected.resolve(socket);
      return socket as unknown as WebSocket;
    },
  }, (_query, signal) => { querySignal = signal; return pending.promise; });
  context.after(() => control.close());
  const first = sockets[0];
  assert.ok(first);
  first.dispatchEvent(new Event("open"));
  assert.equal(control.state(), "online");
  first.receive({ ...request, extra: true });
  assert.equal(querySignal, undefined);
  first.receive(request);
  assert.ok(querySignal);
  first.close();
  assert.equal((querySignal as AbortSignal).aborted, true);
  const second = await connected.promise;
  second.dispatchEvent(new Event("open"));
  pending.resolve({ requestId: request.requestId, error: "FLEX_READ_FAILED" });
  await Promise.resolve();
  assert.deepEqual([...first.sent, ...second.sent], []);
  second.close();
  control.close();
  await delay(10);
  assert.equal(sockets.length, 2);
  assert.equal(control.state(), "stopped");
});
