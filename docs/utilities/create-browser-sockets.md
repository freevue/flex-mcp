# createBrowserSockets

[Workers 구현](../mcp/worker-implementation.md) · [소스](../../apps/mcp-server/worker/browserSockets.ts)

현재 등록에 맞는 소켓을 관리합니다. 소켓을 처음 열면 5초 안에 접속권을 확인합니다. 절전 뒤에는 저장한 등록을 다시 읽습니다.

```typescript
declare function createBrowserSockets(context: DurableObjectState, database: StateDatabase, relay: RelayContext): WorkerBrowserSockets;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `context` | `DurableObjectState` | WebSocket을 받는 객체 문맥입니다. |
| `database` | `StateDatabase` | 접속권과 현재 등록 저장소입니다. |
| `relay` | `RelayContext` | 활성 소켓과 대기 요청을 관리합니다. |

| TC | 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-CREATE-BROWSER-SOCKETS-01 | 두 사용자 소켓을 인증하고 한 사람의 등록을 해제합니다. | 해제한 연결만 닫습니다. | 로컬 Workers 통합. 절전과 실제 Chrome 검증은 예정 |

`WorkerBrowserSockets`는 반환 계약을 설명하는 문서 이름입니다. `open()`은 전환 응답을 만듭니다. `onMessage(socket, message)`와 `onClose(socket)`는 소켓 사건을 처리합니다. `terminate(socket, code?)`는 소켓을 닫습니다.
