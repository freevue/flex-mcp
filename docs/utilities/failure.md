# failure

[서버 함수 목록](../mcp/functions.md) · [구현](../../shared/contracts.ts)

오류를 ok: false와 error로 감쌉니다.

```typescript
declare function failure<Failure>(error: Failure): Outcome<never, Failure>;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `error` | `Failure` | 함수가 분류한 오류 값입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-FAILURE-01 | 잘못된 응답을 분류합니다. | 성공 값 없이 오류를 전달합니다. | [연결한 검사](../../apps/mcp-server/test/relay.test.ts) |
