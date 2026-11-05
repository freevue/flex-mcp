import assert from "node:assert/strict";
import { test } from "node:test";
import { parseAnnualLeave, readAnnualLeave, readCurrentUser, readFlexJson, readSchedule, readWorkHours, runFlexQuery } from "../src/flex/index.ts";
import type { FlexPageContext, FlexReadRequest } from "../src/flex/index.ts";

const signal = new AbortController().signal;
const asOf = new Date("2027-01-01T00:00:00Z");
const user = { userRef: "example-user" };
const binding = { profileId: "example-profile", ...user };
const range = { from: "2027-01-01", to: "2027-01-02" };
const zero = { days: 0, totalMinutes: 0, breakdown: { days: 0, hours: 0, minutes: 0 } };
const present = { days: 1, totalMinutes: 480, breakdown: { days: 1, hours: 0, minutes: 0 } };
const asResponse = (value: unknown) => ({ kind: "response", value });
const page = (read: (request: FlexReadRequest) => unknown): FlexPageContext => ({
  origin: "https://flex.team",
  read: async request => read(request),
  now: () => asOf,
});

test("연차는 0과 두 잔액을 구분하고 출력 허용 필드만 담는다", async () => {
  const result = await runFlexQuery(page(request => asResponse(request.kind === "currentUser" ? user : {
    remaining: { ...present, syntheticExtra: "drop" }, usable: zero,
  })), { kind: "leave" }, binding, signal);
  assert.deepEqual(result, { ok: true, value: { asOf: asOf.toISOString(), remaining: present, usable: zero } });
  assert.deepEqual(parseAnnualLeave({ kind: "no-records" }, asOf), { ok: false, error: "FLEX_NO_RECORDS" });
  assert.deepEqual(parseAnnualLeave({ remaining: present }, asOf), { ok: false, error: "FLEX_READ_FAILED" });
});

test("다른 사이트·재로그인·HTML·중단된 읽기를 구분한다", async () => {
  const request = { kind: "currentUser" } as const;
  const controller = new AbortController();
  let calls = 0;
  const context = page(() => { calls += 1; controller.abort(); return asResponse(user); });
  const rejected = { ok: false, error: "FLEX_READ_FAILED" };
  assert.deepEqual(await readFlexJson({ ...context, origin: "https://other.invalid" }, request, signal), rejected);
  assert.equal(calls, 0);
  assert.deepEqual(await readFlexJson(page(() => ({ kind: "reauth" })), request, signal),
    { ok: false, error: "FLEX_REAUTH_REQUIRED" });
  assert.deepEqual(await readFlexJson(page(() => asResponse("<html>")), request, signal), rejected);
  assert.deepEqual(await readFlexJson(context, request, controller.signal), rejected);
  assert.equal(calls, 1);
});

test("조회 전후 계정 불일치는 결과를 전달하지 않는다", async () => {
  let accountChecks = 0;
  let leaveChecks = 0;
  const context = page(request => {
    if (request.kind !== "currentUser") {
      leaveChecks += 1;
      return asResponse({ remaining: present, usable: zero });
    }
    accountChecks += 1;
    return asResponse(accountChecks === 1 ? user : { userRef: "other-user" });
  });
  const denied = { ok: false, error: "FLEX_ACCOUNT_MISMATCH" };
  assert.deepEqual(await runFlexQuery(context, { kind: "leave" }, binding, signal), denied);
  assert.deepEqual(await runFlexQuery(context, { kind: "leave" }, binding, signal), denied);
  assert.equal(leaveChecks, 1);
});

test("본인 기본 일정의 기간 경계·반복 중복·빈 결과·불완전한 응답을 구분한다", async () => {
  const primary = { calendarRef: "sample", ownerRef: user.userRef, primary: true };
  const base = { calendarRef: "sample", type: "example", status: "example" };
  const allDay = { ...base, eventRef: "all", title: "종일", allDay: true, startAt: "2026-12-31", endAtExclusive: "2027-01-02" };
  const timed = { ...base, eventRef: "timed", title: "시간", allDay: false,
    startAt: "2027-01-02T09:00:00+09:00", endAtExclusive: "2027-01-02T10:00:00+09:00" };
  const outside = { ...allDay, eventRef: "outside", startAt: "2027-01-03", endAtExclusive: "2027-01-04" };
  const context = page(request => {
    if (request.kind === "primaryCalendar") return asResponse(primary);
    assert.equal("endExclusive" in request && request.endExclusive, "2027-01-03");
    return asResponse({ complete: true, events: request.kind === "calendarEvents" ? [timed, outside, allDay] : [timed] });
  });
  const result = await readSchedule(context, user, range, signal);
  assert.ok(result.ok);
  assert.deepEqual(result.value.events.map(event => event.title), ["종일", "시간"]);
  assert.ok(result.value.events.every(event => !Object.hasOwn(event, "eventRef") && !Object.hasOwn(event, "calendarRef")));

  for (const payload of [{ complete: false, events: [] }, { complete: true, events: [{ ...timed, calendarRef: "other" }] }]) {
    const bad = await readSchedule(page(request => asResponse(request.kind === "primaryCalendar" ? primary : payload)), user, range, signal);
    assert.deepEqual(bad, { ok: false, error: "FLEX_READ_FAILED" });
  }
  const empty = await readSchedule(page(request => asResponse(request.kind === "primaryCalendar" ? primary
    : { complete: true, events: [] })), user, range, signal);
  assert.deepEqual(empty, { ok: true, value: { ...range, timezone: "Asia/Seoul", events: [] } });
});

test("근무 시간은 다섯 집계를 읽고 누락된 값을 추정하지 않는다", async () => {
  const totals = { actualMinutes: 0, recognizedMinutes: 1, requiredAgreedMinutes: 2, overtimeMinutes: 0, timeOffMinutes: 3 };
  const get = (value: unknown) => readWorkHours(page(() => asResponse(value)), user, range, signal);
  assert.deepEqual(await get({ ...totals, syntheticExtra: "drop" }),
    { ok: true, value: { ...range, timezone: "Asia/Seoul", ...totals } });
  assert.deepEqual(await get({ kind: "no-records" }), { ok: false, error: "FLEX_NO_RECORDS" });
  assert.deepEqual(await get({ ...totals, actualMinutes: undefined }), { ok: false, error: "FLEX_READ_FAILED" });
});

test("계정 확인은 계정 참조만 반환하고 재로그인과 형식 오류를 구분한다", async () => {
  assert.deepEqual(await readCurrentUser(page(() => asResponse({ ...user, displayName: "합성" })), signal), { ok: true, value: user });
  assert.deepEqual(await readCurrentUser(page(() => ({ kind: "reauth" })), signal), { ok: false, error: "FLEX_REAUTH_REQUIRED" });
  assert.deepEqual(await readCurrentUser(page(() => asResponse({ displayName: "합성" })), signal), { ok: false, error: "FLEX_READ_FAILED" });
});

test("연차는 재로그인과 기록 없음을 전달하고 두 잔액이 0이어도 성공한다", async () => {
  const get = (reply: unknown) => readAnnualLeave(page(() => reply), user, asOf, signal);
  assert.deepEqual(await get({ kind: "reauth" }), { ok: false, error: "FLEX_REAUTH_REQUIRED" });
  assert.deepEqual(await get(asResponse({ kind: "no-records" })), { ok: false, error: "FLEX_NO_RECORDS" });
  assert.deepEqual(await get(asResponse({ remaining: zero, usable: zero })),
    { ok: true, value: { asOf: asOf.toISOString(), remaining: zero, usable: zero } });
  const checked: string[] = [];
  const result = await runFlexQuery(page(request => {
    checked.push(request.kind);
    return { kind: "reauth" };
  }), { kind: "leave" }, binding, signal);
  assert.deepEqual(result, { ok: false, error: "FLEX_REAUTH_REQUIRED" });
  assert.deepEqual(checked, ["currentUser"]);
});

test("응답을 주지 않는 합성 조회를 중단하면 기다리지 않는다", async () => {
  const controller = new AbortController();
  const pending = readFlexJson({
    origin: "https://flex.team",
    read: () => new Promise(() => {}),
  }, { kind: "currentUser" }, controller.signal);
  controller.abort();
  assert.deepEqual(await pending, { ok: false, error: "FLEX_READ_FAILED" });
});
