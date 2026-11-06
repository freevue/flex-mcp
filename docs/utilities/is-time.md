# isTime

[서버 함수 목록](../mcp/functions.md) · [구현](../../shared/validation.ts)

시간대가 있는 시각 문자열인지 확인합니다. 날짜와 시·분·초의 범위를 확인합니다.

```typescript
declare function isTime(value: unknown): value is string;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `unknown` | 확인할 시각입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-IS-TIME-01 | 같은 시각에 시간대가 있는 값과 없는 값을 보냅니다. | 시간대가 있는 유효한 값만 통과합니다. | 직접 자동 검사 예정 |
