# sendJson

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/remote/http.ts)

지정한 상태와 JSON 본문을 보냅니다. 응답의 Content-Type은 application/json입니다. Cache-Control은 no-store입니다.

```typescript
declare function sendJson(response: ServerResponse, status: number, value: unknown): void;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `response` | `ServerResponse` | 쓸 HTTP 응답입니다. |
| `status` | `number` | 응답 상태 코드입니다. |
| `value` | `unknown` | JSON으로 보낼 값입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-SEND-JSON-01 | 상태와 객체를 보냅니다. | JSON 본문과 no-store 헤더를 받습니다. | 직접 자동 검사 예정 |
