# isDate

[서버 함수 목록](../mcp/functions.md) · [구현](../../shared/validation.ts)

YYYY-MM-DD 형태와 실제 날짜를 확인합니다. 존재하지 않는 날짜는 거부합니다.

```typescript
declare function isDate(value: unknown): value is string;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `unknown` | 확인할 날짜입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-IS-DATE-01 | 윤일과 존재하지 않는 날짜를 각각 보냅니다. | 유효한 날짜만 통과합니다. | [연결한 검사](../../apps/mcp-server/test/dates.test.ts) |
