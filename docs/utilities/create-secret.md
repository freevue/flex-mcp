# createSecret

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/registration/stateDatabase.ts)

무작위 32바이트로 43자 비공개 값을 만듭니다. Base64url 문자만 사용합니다.

```typescript
declare function createSecret(): string;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| 없음 | 해당 없음 | 인자를 받지 않습니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-CREATE-SECRET-01 | 키를 발급합니다. | 형식 검사를 통과하고 다른 발급 값과 같지 않습니다. | [연결한 검사](../../apps/mcp-server/test/registration.test.ts) |
