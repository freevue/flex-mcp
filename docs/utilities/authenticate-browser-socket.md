# authenticateBrowserSocket

[유틸 목록](../../UTILITIES.md) · [공유 연결 흐름](../features/shared-connection-flow.md)

첫 메시지의 접속권을 확인하고 등록에 현재 소켓을 연결합니다.

구현 위치: `apps/mcp-server/src/remote/browserSocket.ts`

```typescript
declare function authenticateBrowserSocket(socket: WebSocket, database: DatabaseSync, relay: RelayContext): void;
```

`socket`은 허용한 Chrome 출처의 새 소켓입니다. `database`는 접속권과 등록을 확인하는 저장소입니다. `relay`는 대기 요청과 활성 소켓을 담습니다.

`TC-U-AUTHENTICATE-BROWSER-SOCKET-01`: 접속권이 없거나 5초 안에 인증하지 않으면 연결을 닫습니다.
