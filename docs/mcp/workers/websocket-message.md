# webSocketMessage

[예정 함수 목록](README.md) · [배포 설계](../cloudflare-workers.md)

상태: 구현 예정. Durable Object가 수신 메시지를 받을 때 호출합니다. 첫 메시지는 일회용 접속권을 검사합니다. 인증 뒤에는 ping 또는 대기 중인 조회 응답만 처리합니다.

```typescript
declare function webSocketMessage(socket: WebSocket, message: string | ArrayBuffer): Promise<void>;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `socket` | `WebSocket` | 메시지를 보낸 서버 쪽 소켓입니다. |
| `message` | `string \| ArrayBuffer` | 수신한 메시지입니다. 이 계약에서는 텍스트만 처리합니다. |

| TC | 입력과 조건 | 기대 결과 |
| --- | --- | --- |
| TC-W-WEBSOCKET-MESSAGE-01 | 사용한 접속권을 다시 보냅니다. | 인증을 거부합니다. |
| TC-W-WEBSOCKET-MESSAGE-02 | 절전에서 돌아온 소켓이 이전 요청 ID로 응답합니다. | 현재 대기 요청이 없으면 응답을 버립니다. |
