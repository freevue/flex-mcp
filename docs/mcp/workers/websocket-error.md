# webSocketError

[예정 함수 목록](README.md) · [배포 설계](../cloudflare-workers.md)

상태: 구현 예정. 오류가 난 소켓을 정리합니다. 같은 소켓의 대기 요청을 끝냅니다. 오류 원문이나 조회 결과를 로그에 넣지 않습니다.

```typescript
declare function webSocketError(socket: WebSocket, error: unknown): void;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `socket` | `WebSocket` | 오류가 난 서버 쪽 소켓입니다. |
| `error` | `unknown` | 런타임에서 받은 오류입니다. |

| TC | 입력과 조건 | 기대 결과 |
| --- | --- | --- |
| TC-W-WEBSOCKET-ERROR-01 | 한 사용자의 소켓에 오류를 발생시킵니다. | 해당 소켓의 대기 요청만 끝냅니다. |
