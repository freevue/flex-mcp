# handle

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/remote/createRemoteServer.ts)

Node HTTP 내부 함수입니다. /mcp와 등록 경로를 나눕니다. 등록 경로에 확장 출처 검사를 적용합니다.

```typescript
declare function handle(request: IncomingMessage, response: ServerResponse): Promise<void>;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `request` | `IncomingMessage` | 수신한 HTTP 요청입니다. |
| `response` | `ServerResponse` | 전송할 HTTP 응답입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-HANDLE-HTTP-01 | 등록 시작 요청에 확장 출처를 보내지 않습니다. | 403을 반환합니다. | [연결한 검사](../../apps/mcp-server/test/shared-remote.test.ts) |
| TC-U-HANDLE-HTTP-02 | 정의하지 않은 경로를 호출합니다. | 404를 반환합니다. | 직접 자동 검사 예정 |
