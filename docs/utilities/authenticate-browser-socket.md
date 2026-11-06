# authenticateBrowserSocket

[유틸 목록](../../UTILITIES.md) · [공유 연결 흐름](../features/shared-connection-flow.md)

첫 메시지의 접속권을 확인하고 등록에 현재 소켓을 연결합니다.

구현 위치: `apps/mcp-server/src/remote/browserSocket.ts`

```typescript
declare function authenticateBrowserSocket(socket: WebSocket, database: DatabaseSync, relay: RelayContext): void;
```

`socket`은 허용한 Chrome 출처의 새 소켓입니다. `database`는 접속권과 등록을 확인하는 저장소입니다. `relay`는 대기 요청과 활성 소켓을 담습니다.

| 소켓 함수 | 매개변수 | 역할 |
| --- | --- | --- |
| `isOpen()` | 없음 | 현재 소켓을 사용할 수 있는지 확인합니다. |
| `send(request)` | `request: BridgeRequest` | 열린 소켓에 조회를 보냅니다. |
| `close()` | 없음 | 연결을 종료합니다. |
| `onClose(receive)` | `receive: () => void` | 소켓 종료를 한 번 전달합니다. |
| `onReply(receive)` | `receive: (value: unknown) => void` | ping을 처리하고 나머지 응답을 중계 함수에 전달합니다. |

| TC | 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-AUTHENTICATE-BROWSER-SOCKET-01 | 접속권이 없거나 5초 안에 인증하지 않습니다. | 연결을 닫습니다. | 시간 제한 직접 검사 예정 |
| TC-U-AUTHENTICATE-BROWSER-SOCKET-02 | 유효한 접속권으로 처음 인증합니다. | 현재 등록에 소켓을 연결하고 ready를 보냅니다. | [원격 Node 통합](../../apps/mcp-server/test/shared-remote.test.ts) |
