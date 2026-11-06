# createMcpServer

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/createMcpServer.ts)

도구 이름과 입력 규칙을 등록합니다. 핸들러가 없으면 공개 검사 모드입니다. 조회 핸들러만 있으면 연결 도구를 등록하지 않습니다.

```typescript
declare function createMcpServer(handlers?: ToolHandlers, now?: () => Date, synthetic?: boolean): McpServer;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `handlers` | `ToolHandlers` | 선택입니다. 조회, 소켓 상태와 승인 함수를 담습니다. |
| `now` | `() => Date` | 선택입니다. 기본값은 현재 시각을 읽는 함수입니다. |
| `synthetic` | `boolean` | 선택입니다. 기본값은 false입니다. true이면 성공한 조회에 synthetic: true를 붙입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-CREATE-MCP-SERVER-01 | 핸들러 없이 도구를 호출합니다. | 유효한 입력에도 미연결 오류를 반환합니다. | [연결한 검사](../../apps/mcp-server/test/public-server.test.ts) |
| TC-U-CREATE-MCP-SERVER-02 | 조회 핸들러만 줍니다. | 읽기 도구 세 개를 등록합니다. 연결 도구는 없습니다. | 직접 자동 검사 예정 |
