# createCallerMcpServer

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/createCallerMcpServer.ts)

서버가 확인한 신원을 도구에 연결합니다. 조회는 권한을 확인한 뒤 중계합니다. 상태는 서버의 현재 등록과 소켓을 읽습니다.

```typescript
declare function createCallerMcpServer(identity: VerifiedCallerIdentity | null, relay: RelayContext, now?: () => Date, synthetic?: boolean, approveConnection?: (code: string) => boolean): McpServer;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `identity` | `VerifiedCallerIdentity \| null` | 검증한 호출자입니다. |
| `relay` | `RelayContext` | 권한과 중계 상태입니다. |
| `now` | `() => Date` | 선택입니다. 기준 시각 함수입니다. |
| `synthetic` | `boolean` | 선택입니다. 기본값은 false입니다. |
| `approveConnection` | `(code: string) => boolean` | 선택입니다. 이 신원으로 코드를 승인하는 함수입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-CREATE-CALLER-MCP-SERVER-01 | 다른 사용자 또는 미등록 호출자가 연차를 요청합니다. | 조회 권한을 거부하고 브라우저에 보내지 않습니다. | [연결한 검사](../../apps/mcp-server/test/query-integration.test.ts) |
| TC-U-CREATE-CALLER-MCP-SERVER-02 | 승인 권한을 가진 호출자가 유효한 코드를 보냅니다. | 승인 결과만 반환합니다. | [연결한 검사](../../apps/mcp-server/test/shared-remote.test.ts) |
