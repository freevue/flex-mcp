# readJson

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/remote/http.ts)

application/json 본문을 읽습니다. 선언한 길이와 실제 읽은 바이트를 모두 확인합니다. 크기를 넘거나 JSON이 아니면 undefined입니다.

```typescript
declare function readJson(request: IncomingMessage, limit: number): Promise<unknown>;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `request` | `IncomingMessage` | 수신한 본문과 헤더입니다. |
| `limit` | `number` | 허용할 최대 바이트입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-READ-JSON-01 | 길이 헤더가 없고 본문이 상한을 넘습니다. | undefined를 반환합니다. | 직접 자동 검사 예정 |
| TC-U-READ-JSON-02 | 제한 안의 JSON 본문을 보냅니다. | 해석한 값을 반환합니다. | [연결한 검사](../../apps/mcp-server/test/shared-remote.test.ts) |
