import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveTodayActualMinutes } from "../src/flex/resolveTodayActualMinutes.ts";
import type { ActiveWorkSnapshot } from "../src/flex/resolveTodayActualMinutes.ts";

const date = "2027-01-04";
const epoch = (time: string) => Date.parse(`${date}T${time}:00+09:00`);
const snapshot = (startMs = epoch("09:00"), breaks: NonNullable<ActiveWorkSnapshot["ongoing"]>["breaks"] = []): ActiveWorkSnapshot => ({
  date,
  ongoing: { startMs, breaks }
});
const idle: ActiveWorkSnapshot = { date, ongoing: null };
const today = (recorded: number, at: string, before: ActiveWorkSnapshot | null, after = before) =>
  resolveTodayActualMinutes(recorded, date, epoch(at), before, after);

test("UT-resolveTodayActualMinutes-01: 확정 0분이어도 진행 시간이 늘어난다", () => {
  assert.equal(today(0, "09:10", snapshot()), 10);
  assert.equal(today(0, "09:11", snapshot()), 11);
});

test("UT-resolveTodayActualMinutes-02: 완료된 휴게와 진행 중인 휴게를 뺀다", () => {
  const running = snapshot(epoch("09:00"), [{ startMs: epoch("09:05"), endMs: epoch("09:10") }]);
  assert.equal(today(20, "09:12", running), 27);
  const paused = snapshot(epoch("09:00"), [
    { startMs: epoch("09:05"), endMs: epoch("09:10") },
    { startMs: epoch("09:12"), endMs: null }
  ]);
  assert.equal(today(20, "09:15", paused), 27);
  assert.equal(today(20, "09:16", paused), 27);
});

test("UT-resolveTodayActualMinutes-03: 종료된 기록을 다시 더하지 않는다", () => {
  assert.equal(today(45, "09:45", idle), 45);
  assert.equal(today(45, "09:45", snapshot(), idle), null);
  assert.equal(today(0, "09:45", idle, snapshot()), null);
});

test("UT-resolveTodayActualMinutes-04: 조회 실패와 실제 0분을 구분한다", () => {
  assert.equal(today(0, "09:00", idle), 0);
  assert.equal(today(0, "09:00", null, idle), null);
  assert.equal(today(0, "09:00", idle, null), null);
});

test("UT-resolveTodayActualMinutes-05: 한국 시간의 오늘 범위와 휴게 경계를 지킨다", () => {
  const overnight = snapshot(Date.parse("2027-01-03T23:45:00+09:00"), [{ startMs: Date.parse("2027-01-03T23:55:00+09:00"), endMs: epoch("00:05") }]);
  assert.equal(today(0, "00:15", overnight), 10);
  const reversed = snapshot(epoch("09:00"), [
    { startMs: epoch("09:10"), endMs: epoch("09:20") },
    { startMs: epoch("09:05"), endMs: epoch("09:15") }
  ]);
  assert.equal(today(0, "09:30", reversed), null);
  const future = snapshot(epoch("09:00"), [{ startMs: epoch("09:40"), endMs: null }]);
  assert.equal(today(0, "09:30", future), null);
  assert.equal(resolveTodayActualMinutes(0, date, epoch("00:00") + 86_400_000, idle, idle), null);
});

test("UT-resolveTodayActualMinutes-06: 예정 휴게는 조회 시각까지 실제로 겹친 구간만 뺀다", () => {
  const planned = snapshot(epoch("09:00"), [{ startMs: epoch("09:15"), endMs: epoch("09:20") }]);
  assert.equal(today(0, "09:10", planned), 10);
  assert.equal(today(0, "09:17", planned), 15);
  assert.equal(today(0, "09:25", planned), 20);
  const overlapping = snapshot(epoch("09:00"), [
    { startMs: epoch("09:12"), endMs: null },
    { startMs: epoch("09:15"), endMs: epoch("09:20") }
  ]);
  assert.equal(today(0, "09:14", overlapping), 12);
  assert.equal(today(0, "09:17", overlapping), 12);
});
