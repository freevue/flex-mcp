---
name: CompanyHolidaysResult
type: type
module: shared
issues: [25]
code: [shared/companyHolidays.ts]
---

# CompanyHolidaysResult

기간과 본인에게 적용되는 휴일 목록입니다.

## 정의

```typescript
export type CompanyHolidaysResult = DateRange & {
  timezone: typeof timezone;
  holidays: {
    date: string;
    name: string;
    type: "PUBLIC_HOLIDAY" | "CUSTOM_HOLIDAY";
  }[];
};
```

## 필드

| 필드     | 타입                                                                           | 필수 | 의미                                                                                    |
| -------- | ------------------------------------------------------------------------------ | ---- | --------------------------------------------------------------------------------------- |
| timezone | `typeof timezone`                                                              | 예   | 한국 시간입니다. DateRange의 from과 to는 조회한 양 끝 날짜입니다.                       |
| holidays | `{ date: string; name: string; type: "PUBLIC_HOLIDAY" \| "CUSTOM_HOLIDAY" }[]` | 예   | 날짜와 이름 및 유형을 담습니다. 대체공휴일은 PUBLIC_HOLIDAY에 포함됩니다. 날짜순입니다. |

## 사용처

| 위치                                                        | 용도                      |
| ----------------------------------------------------------- | ------------------------- |
| [회사 휴일](../../feature/flex-company-holidays.md)         | 조회 결과를 구성합니다.   |
| [isCompanyHolidays](../../unit/shared/isCompanyHolidays.md) | 필드와 범위를 검증합니다. |
