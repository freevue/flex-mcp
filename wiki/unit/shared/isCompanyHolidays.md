---
name: isCompanyHolidays
type: unit
module: shared
issues: [25]
code: [shared/companyHolidays.ts]
---

# isCompanyHolidays

기간과 휴일 응답이 요청과 일치하는지 검사합니다.

## 시그니처

<!-- prettier-ignore -->
```typescript
export function isCompanyHolidays(value: unknown, range: DateRange): value is CompanyHolidaysResult
```

| 매개변수 | 타입        | 기본값 | 의미                        |
| -------- | ----------- | ------ | --------------------------- |
| value    | `unknown`   | 없음   | 어댑터에서 받은 결과입니다. |
| range    | `DateRange` | 없음   | 검증한 요청 기간입니다.     |

| 반환                             | 의미                                |
| -------------------------------- | ----------------------------------- |
| `value is CompanyHolidaysResult` | 결과의 필드와 값이 맞으면 참입니다. |

## 내부 로직

1. 객체의 기간과 시간대가 요청과 일치하는지 검사합니다.
2. 휴일마다 날짜, 유형과 이름을 검사합니다. 이름은 한 줄의 비어 있지 않은 문자열이며 최대 120자입니다.
3. 날짜가 기간 안에 있고 오름차순이면 참을 반환합니다. 빈 목록도 유효합니다.

## 사용법

```typescript
isCompanyHolidays(value, range);
```

## 사용처

| 위치                                                | 용도                                  |
| --------------------------------------------------- | ------------------------------------- |
| [본인 근무 상태](../../feature/flex-work-status.md) | 같은 읽기 유닛에서 요청을 구분합니다. |
| [회사 휴일](../../feature/flex-company-holidays.md) | 서버와 브라우저의 응답을 검증합니다.  |

## TC

| ID                      | 조건                                                          | 기대 결과                  |
| ----------------------- | ------------------------------------------------------------- | -------------------------- |
| UT-isCompanyHolidays-01 | 정상, 빈 목록, 다른 기간, 날짜 역순과 추가 필드를 입력합니다. | 정상과 빈 목록만 참입니다. |
