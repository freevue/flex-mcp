# handleMcp

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/remote/createRemoteServer.ts)

Node HTTP 내부 함수입니다. 출처, POST 메서드와 본문을 확인합니다. 요청별 MCP 서버를 열고 응답이 닫히면 닫습니다.

```typescript
declare function handleMcp(request: IncomingMessage, response: ServerResponse): Promise<void>;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `request` | `IncomingMessage` | 수신한 /mcp 요청입니다. |
| `response` | `ServerResponse` | 전송할 HTTP 응답입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-HANDLE-MCP-01 | 다른 웹 출처에서 호출합니다. 출처 없이 초기화도 호출합니다. | 다른 출처에는 403을 보냅니다. 초기화는 성공합니다. | [연결한 검사](../../apps/mcp-server/test/shared-remote.test.ts) |
