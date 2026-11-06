# disconnect

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/bridge/attachBrowserBridge.ts)

중계 내부 함수입니다. 닫힌 소켓이 현재 등록이면 목록에서 제거합니다. 그 소켓을 기다리는 요청을 종료합니다.

```typescript
declare function disconnect(closed: BrowserConnection): void;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `closed` | `BrowserConnection` | 닫혔거나 교체할 소켓입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-DISCONNECT-01 | 소켓을 교체한 뒤 이전 소켓의 종료를 받습니다. | 현재 소켓은 남습니다. 이전 소켓의 요청만 BROWSER_OFFLINE으로 끝냅니다. | [연결한 검사](../../apps/mcp-server/test/relay.test.ts) |
