# isExpectedRange

[서버 함수 목록](../mcp/functions.md) · [구현](../../shared/validation.ts)

응답 기간과 한국 시간대가 요청과 일치하는지 확인합니다.

```typescript
declare function isExpectedRange(value: Record<string, unknown>, range: DateRange): boolean;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `Record<string, unknown>` | 서버가 받은 응답입니다. |
| `range` | `DateRange` | 서버가 요청한 시작일과 종료일입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-IS-EXPECTED-RANGE-01 | 정상 기간과 하루 다른 응답을 보냅니다. | 정상 기간과 Asia/Seoul만 true입니다. | 직접 자동 검사 예정 |
