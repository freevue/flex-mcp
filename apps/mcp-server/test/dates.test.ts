import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveRange, seoulDate, shiftDate } from "../src/dates.ts";

test("한국 자정 전후를 구분하고 인자가 없으면 현재 시각을 사용한다", context => {
  assert.equal(seoulDate(new Date("2026-12-31T14:59:59Z")), "2026-12-31");
  context.mock.timers.enable({ apis: ["Date"], now: new Date("2027-01-01T15:00:00Z") });
  assert.equal(seoulDate(), "2027-01-02");
});

test("윤일, 기본 기간, 당일, 역순과 잘못된 날짜를 확인한다", () => {
  assert.equal(shiftDate("2028-03-01", -1), "2028-02-29");
  assert.equal(shiftDate("2027-03-01", -1), "2027-02-28");
  assert.equal(shiftDate("2027-01-31", 0), "2027-01-31");
  const fallback = { from: "2027-01-01", to: "2027-01-07" };
  assert.deepEqual(resolveRange({}, fallback), fallback);
  const sameDay = { ...fallback, to: fallback.from };
  assert.deepEqual(resolveRange(sameDay, fallback), sameDay);
  assert.throws(() => resolveRange({ from: "2027-01-02", to: "2027-01-01" }, fallback), /종료일은 시작일/);
  assert.throws(() => resolveRange({ from: "2027-02-29", to: "2027-03-01" }, fallback), /YYYY-MM-DD/);
});
