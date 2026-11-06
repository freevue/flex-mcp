# secretDigest

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/registration/stateDatabase.ts)

원문을 저장하지 않고 비교할 수 있도록 SHA-256 해시를 계산합니다. 결과는 16진 문자열입니다.

```typescript
declare function secretDigest(secret: string): string;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `secret` | `string` | 해시를 계산할 원문입니다. 로그에 넣지 않습니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-SECRET-DIGEST-01 | 같은 값을 발급과 인증에서 사용합니다. | 저장한 해시와 비교해 올바른 키만 인증합니다. | [연결한 검사](../../apps/mcp-server/test/registration.test.ts) |
