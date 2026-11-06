# successReply

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/createMcpServer.ts)

서버 내부 함수입니다. 같은 값을 구조화 응답과 JSON 텍스트에 넣습니다.

```typescript
declare function successReply(result: Record<string, unknown>): CallToolResult;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `result` | `Record<string, unknown>` | 호출자에게 보낼 검증된 결과 객체입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-SUCCESS-REPLY-01 | 합성 연차 결과를 전달합니다. | 구조화 응답에 두 잔액을 유지합니다. | [연결한 검사](../../apps/mcp-server/test/query-integration.test.ts) |
