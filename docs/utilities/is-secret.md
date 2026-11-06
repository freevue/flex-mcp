# isSecret

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/registration/stateDatabase.ts)

43자 Base64url 형식만 확인합니다. 형식이 맞아도 유효한 키라는 뜻은 아닙니다.

```typescript
declare function isSecret(value: unknown): value is string;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `unknown` | 입력으로 받은 값입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-IS-SECRET-01 | 형식이 다른 요청 키나 승인 코드를 수령에 사용합니다. | 등록 결과를 받지 못합니다. | [연결한 검사](../../apps/mcp-server/test/shared-remote.test.ts) |
