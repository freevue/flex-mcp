# createPairedMcpServer

[Chrome 등록](../features/browser-pairing.md) · [투두 17](https://github.com/freevue/flex-mcp/issues/17)

공유 서버의 도구를 만듭니다. 연결 키로 조회 채널을 확인합니다. 클라이언트를 사전 등록하지 않습니다.

```typescript
declare function createPairedMcpServer(database: StateDatabase, relay: RelayContext, allowApproval?: () => boolean): McpServer;
```

| 매개변수 | 설명 |
| --- | --- |
| `database` | 등록 저장소입니다. |
| `relay` | 현재 등록과 소켓을 관리합니다. |
| `allowApproval` | 선택입니다. 코드 승인 시도 횟수에 적용합니다. |

| TC | 조건 | 기대 결과 |
| --- | --- | --- |
| TC-U-CREATE-PAIRED-MCP-SERVER-01 | 다른 두 채널의 연결 키를 보냅니다. | 각 키는 해당 등록의 소켓만 사용합니다. |
