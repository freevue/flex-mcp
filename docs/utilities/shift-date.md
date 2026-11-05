# shiftDate

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/schedule.md) · [현재 코드](../../apps/mcp-server/src/dates.ts) · [공통 타입](../UTILITY_TYPES.md)

날짜를 지정한 일수만큼 옮깁니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/mcp-server/src/dates.ts` |
| 상태 | 현재 구현 |
| 출력 | 옮긴 `YYYY-MM-DD` 날짜입니다. 일정 조회용 종료일은 종료 날짜에 하루를 더합니다. |
| 실패 | 이 함수는 원본 날짜가 유효한지 검사하지 않습니다. 호출 전에 날짜와 정수 일수를 확인합니다. |

## 함수 계약

```typescript
declare function shiftDate(date: string, days: number): string;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `date` | `string` | 필수 | 호출자가 검사한 `YYYY-MM-DD` 날짜입니다. |
| `days` | `number` | 필수 | 옮길 일수입니다. 양수는 앞으로, 음수는 뒤로 옮깁니다. 정수를 사용합니다. |

## 테스트 케이스

아래 조건에서 `shiftDate`을 호출합니다. 기존 테스트는 [서버 테스트](../../apps/mcp-server/test/public-server.test.ts)에 있습니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-SHIFT-DATE-01 | `date`는 `2026-12-31`, `days`는 `1`입니다. | `2027-01-01`을 반환합니다. | 기존 테스트 |
| TC-U-SHIFT-DATE-02 | `date`는 `2028-03-01`, `days`는 `-1`입니다. | 윤년의 `2028-02-29`를 반환합니다. | 예정 |
| TC-U-SHIFT-DATE-03 | `date`는 `2027-03-01`, `days`는 `-1`입니다. | `2027-02-28`을 반환합니다. | 예정 |
| TC-U-SHIFT-DATE-04 | `date`는 `2027-01-31`, `days`는 `0`입니다. | `2027-01-31`을 반환합니다. | 예정 |
