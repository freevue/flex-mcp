# seoulDate

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/schedule.md) · [현재 코드](../../apps/mcp-server/src/dates.ts) · [공통 타입](../UTILITY_TYPES.md)

한 시각을 한국 시간의 날짜로 바꿉니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/mcp-server/src/dates.ts` |
| 상태 | 현재 구현 |
| 출력 | `Asia/Seoul`의 `YYYY-MM-DD` 날짜입니다. |
| 실패 | 유효한 시각만 받습니다. 날짜 형식 검사는 호출하는 쪽에서 합니다. |

## 함수 계약

```typescript
declare function seoulDate(now?: Date): string;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `now` | `Date` | 선택 | 한국 날짜로 바꿀 시각입니다. 생략하면 함수 호출 시각을 사용합니다. |

## 테스트 케이스

아래 조건에서 `seoulDate`을 호출합니다. 기존 테스트는 [서버 테스트](../../apps/mcp-server/test/public-server.test.ts)에 있습니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-SEOUL-DATE-01 | `now`는 `2026-12-31T15:00:00Z`입니다. | `2027-01-01`을 반환합니다. | 기존 테스트 |
| TC-U-SEOUL-DATE-02 | `now`는 `2026-12-31T14:59:59Z`입니다. | `2026-12-31`을 반환합니다. | [로컬 테스트](../../apps/mcp-server/test/dates.test.ts) |
| TC-U-SEOUL-DATE-03 | 현재 시각을 `2027-01-01T15:00:00Z`로 고정하고 `now`를 생략합니다. | `2027-01-02`를 반환합니다. | [로컬 테스트](../../apps/mcp-server/test/dates.test.ts) |
