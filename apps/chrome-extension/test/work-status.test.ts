import assert from "node:assert/strict";
import { test } from "node:test";
import { failure, isWorkStatusResult, success } from "../../../shared/index.ts";
import { readLiveReply } from "../src/bridge/index.ts";
import type { BridgeRequest } from "../../../shared/index.ts";
import type { FlexReader } from "../src/bridge/index.ts";

const request: BridgeRequest = { requestId: "status-read", query: { kind: "workStatus" } };
const account = "승인된 계정";
const reader: FlexReader = {
  identify: async () => success(account),
  read: async () => ({ requestId: request.requestId, error: "FLEX_READ_FAILED" }),
  workSummary: async () => null
};

test("UT-isWorkStatusResult-01: 상태 네 값과 정확한 필드만 허용한다", () => {
  for (const status of ["working", "on_break", "idle", "unknown"]) assert.equal(isWorkStatusResult({ status }), true);
  for (const value of [null, {}, { status: "stop" }, { status: "idle", details: "extra" }]) {
    assert.equal(isWorkStatusResult(value), false);
  }
});

test("UT-readLiveReply-01: 승인된 계정의 상태를 읽고 읽을 수 없으면 확인 불가를 응답한다", async () => {
  const signal = new AbortController().signal;
  const active: FlexReader = { ...reader, workStatus: async (expected) => success({ status: expected === account ? "on_break" : "unknown" }) };
  const malformed: FlexReader = { ...reader, workStatus: async () => success({ status: "idle", details: "extra" }) };
  assert.deepEqual(await readLiveReply(active, request, account, signal), { requestId: request.requestId, result: { status: "on_break" }, source: "flex" });
  for (const fixture of [reader, malformed]) {
    assert.deepEqual(await readLiveReply(fixture, request, account, signal), { requestId: request.requestId, result: { status: "unknown" }, source: "flex" });
  }
});

test("UT-readLiveReply-02: 계정 변경과 취소는 상태를 보내지 않는다", async () => {
  const controller = new AbortController();
  const mismatch: FlexReader = { ...reader, workStatus: async () => failure("FLEX_ACCOUNT_MISMATCH") };
  assert.deepEqual(await readLiveReply(mismatch, request, account, controller.signal), { requestId: request.requestId, error: "FLEX_ACCOUNT_MISMATCH" });
  const cancelled: FlexReader = {
    ...reader,
    workStatus: async () => {
      controller.abort();
      return success({ status: "idle" });
    }
  };
  assert.deepEqual(await readLiveReply(cancelled, request, account, controller.signal), { requestId: request.requestId, error: "FLEX_READ_FAILED" });
});
