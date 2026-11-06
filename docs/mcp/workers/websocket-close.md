# webSocketClose

[예정 함수 목록](README.md) · [배포 설계](../cloudflare-workers.md)

상태: 구현 예정. 닫힌 소켓과 연결 상태를 대조합니다. 닫힌 소켓에 속한 대기 요청만 종료합니다. 이미 교체한 새 소켓은 유지합니다.

```typescript
declare function webSocketClose(socket: WebSocket, code: number, reason: string, wasClean: boolean): void;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `socket` | `WebSocket` | 닫힌 서버 쪽 소켓입니다. |
| `code` | `number` | WebSocket 종료 코드입니다. |
| `reason` | `string` | 상대가 보낸 종료 이유입니다. 원문을 로그에 넣지 않습니다. |
| `wasClean` | `boolean` | 프로토콜의 정상 종료 여부입니다. |

| TC | 입력과 조건 | 기대 결과 |
| --- | --- | --- |
| TC-W-WEBSOCKET-CLOSE-01 | 이전 소켓의 종료가 새 소켓 등록 뒤에 도착합니다. | 새 소켓을 닫지 않습니다. 이전 요청만 종료합니다. |
