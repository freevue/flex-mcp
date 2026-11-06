# success

[서버 함수 목록](../mcp/functions.md) · [구현](../../shared/contracts.ts)

성공 값을 ok: true와 value로 감쌉니다.

```typescript
declare function success<Value>(value: Value): Outcome<Value, never>;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `Value` | 함수가 만든 성공 값입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-SUCCESS-01 | 등록을 확인한 값을 감쌉니다. | 호출자는 ok와 value를 읽을 수 있습니다. | [연결한 검사](../../apps/mcp-server/test/registration.test.ts) |
