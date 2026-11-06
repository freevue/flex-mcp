# flex_get_socket_status

[도구 목록](../README.md) · [소켓 상태와 다음 행동](../../features/socket-status.md)

소켓은 Chrome 확장과 서버 사이의 연결입니다. 이 도구는 연결 키에 해당하는 등록과 소켓만 확인합니다.

| 인자 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `connectionKey` | `string` | 원격에서 필수 | 코드 승인 때 받은 해당 채널의 연결 키입니다. |

원격 성공 결과는 `{ status: "offline" | "online" }`입니다. 등록은 있고 소켓이 닫혔으면 `offline`입니다. 소켓이 열려 있으면 `online`입니다. 등록을 받기 전이나 해제한 뒤에는 연결 키를 거부합니다.

[createPairedMcpServer](../../utilities/create-paired-mcp-server.md)가 연결 키로 채널을 찾습니다. [getBrowserConnectionStatus](../../utilities/get-browser-connection-status.md)가 권한, 등록과 소켓을 읽습니다. 확장에 조회 메시지를 보내지 않습니다. `online`은 Flex 로그인이나 실제 조회 가능 여부를 뜻하지 않습니다.

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-MCP-SOCKET-01 | 확장이 등록을 받은 뒤 소켓을 엽니다. | 해당 채널의 상태가 `offline`에서 `online`으로 바뀝니다. | [원격 Node 통합](../../../apps/mcp-server/test/shared-remote.test.ts) |
| TC-MCP-SOCKET-02 | 등록을 해제한 뒤 이전 연결 키를 보냅니다. | 연결 키를 거부합니다. | [원격 Node 통합](../../../apps/mcp-server/test/shared-remote.test.ts) |
| TC-MCP-SOCKET-03 | 잘못된 인증을 보내거나 다른 등록 ID를 인자에 넣습니다. | 상태를 반환하지 않습니다. | [원격 Node 통합](../../../apps/mcp-server/test/shared-remote.test.ts) |
