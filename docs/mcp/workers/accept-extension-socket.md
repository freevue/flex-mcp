# acceptExtensionSocket

[예정 함수 목록](README.md) · [배포 설계](../cloudflare-workers.md)

상태: 구현 예정. 허용한 WebSocket 전환 요청에서 소켓 쌍을 만듭니다. 서버 쪽을 Durable Object에 등록합니다. 첫 메시지의 인증이 끝나기 전에는 조회를 보내지 않습니다.

```typescript
declare function acceptExtensionSocket(request: Request): Promise<Response>;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `request` | `Request` | 허용된 확장 출처와 WebSocket 전환 요청입니다. |

| TC | 입력과 조건 | 기대 결과 |
| --- | --- | --- |
| TC-W-ACCEPT-EXTENSION-SOCKET-01 | 전환 헤더가 없거나 출처가 Chrome 확장 형식이 아닙니다. | 소켓을 열지 않습니다. |
| TC-W-ACCEPT-EXTENSION-SOCKET-02 | 전환 뒤 5초 안에 인증하지 않습니다. | 대기 소켓을 닫습니다. |
