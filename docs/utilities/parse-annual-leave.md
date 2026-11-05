# parseAnnualLeave

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/annual-leave.md) · [공통 타입](../UTILITY_TYPES.md)

연차 응답에서 도구 결과에 필요한 값만 고릅니다. 네트워크 요청은 하지 않습니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/chrome-extension/src/flex/parseAnnualLeave.ts` |
| 상태 | 구현 |
| 출력 | `asOf`, `remaining`, `usable`입니다. 일수와 총 분, 일·시간·분을 유지합니다. |
| 실패 | 잔액이 0이면 성공입니다. 기록이 없다고 명시한 응답은 `FLEX_NO_RECORDS`입니다. 필수 수치가 빠지면 `FLEX_READ_FAILED`입니다. |

## 함수 계약

```typescript
declare function parseAnnualLeave(raw: unknown, asOf: Date): Outcome<AnnualLeaveResult, "FLEX_NO_RECORDS" | "FLEX_READ_FAILED">;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `raw` | `unknown` | 필수 | 조회 직후 받은 연차 응답입니다. 형태를 확인하기 전에는 신뢰하지 않습니다. |
| `asOf` | `Date` | 필수 | 조회에 사용할 유효한 시각입니다. |

## 테스트 케이스

아래 조건에서 `parseAnnualLeave`을 호출합니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-PARSE-ANNUAL-LEAVE-01 | 합성 잔액에서 잔여량은 2일, 사용 가능량은 1일입니다. 조회 시각을 고정합니다. | 두 잔액을 바꾸지 않습니다. `asOf`에는 입력한 시각을 ISO 8601로 반환합니다. | [로컬 테스트](../../apps/chrome-extension/test/flex.test.ts) |
| TC-U-PARSE-ANNUAL-LEAVE-02 | 두 잔액의 일수와 분이 모두 0입니다. | 두 잔액을 0으로 반환합니다. 오류로 처리하지 않습니다. | [로컬 테스트](../../apps/chrome-extension/test/flex.test.ts) |
| TC-U-PARSE-ANNUAL-LEAVE-03 | 응답이 잔액 기록이 없다고 명시합니다. | `FLEX_NO_RECORDS`를 반환합니다. | [로컬 테스트](../../apps/chrome-extension/test/flex.test.ts) |
| TC-U-PARSE-ANNUAL-LEAVE-04 | 필수 분 값이 숫자 대신 문자열이거나 빠져 있습니다. | `FLEX_READ_FAILED`를 반환합니다. 0으로 채우지 않습니다. | [로컬 테스트](../../apps/chrome-extension/test/flex.test.ts) |
