import assert from "node:assert/strict";
import { test } from "node:test";
import * as shared from "../../../shared/index.ts";
import { readLiveReply } from "../src/bridge/index.ts";
import type { FlexReader } from "../src/bridge/index.ts";

test("UT-isCompanyHolidays-01: 기간, 분류, 날짜순과 허용 필드를 검사한다", () => {
  const range = { from: "2027-01-01", to: "2027-01-10" };
  const holiday = { date: "2027-01-01", name: "예시 공휴일", type: "PUBLIC_HOLIDAY" };
  const result = { ...range, timezone: shared.timezone, holidays: [holiday] };
  assert.equal(shared.isCompanyHolidays(result, range), true);
  assert.equal(shared.isCompanyHolidays({ ...result, holidays: [] }, range), true);
  for (const holidays of [
    [{ ...holiday, group: "예시" }],
    [{ ...holiday, date: "2027-02-01" }],
    [{ ...holiday, type: "USER_HOLIDAY" }],
    [{ ...holiday, date: "2027-01-02" }, holiday]
  ])
    assert.equal(shared.isCompanyHolidays({ ...result, holidays }, range), false);
});

test("FT-FLEX-HOLIDAYS-03: 승인된 조회 범위가 없으면 빈 목록 대신 오류를 반환한다", async () => {
  const reader: FlexReader = {
    identify: async () => shared.success("예시 계정"),
    read: async () => {
      throw new Error("승인된 휴일 어댑터 없이 다른 읽기를 호출했습니다.");
    },
    workSummary: async () => null
  };
  const request = { requestId: "holiday", query: { kind: "companyHolidays", range: { from: "2027-01-01", to: "2027-01-01" } } } as const;
  assert.deepEqual(await readLiveReply(reader, request, "예시 계정", AbortSignal.timeout(1_000)), {
    requestId: request.requestId,
    error: "FLEX_SCOPE_UNAVAILABLE"
  });
});
