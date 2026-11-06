# readBearer

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/remote/http.ts)

Authorization 헤더에서 Bearer 뒤의 43자 키를 읽습니다. 형식이 맞지 않으면 빈 문자열을 반환합니다.

```typescript
declare function readBearer(request: IncomingMessage): string;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `request` | `IncomingMessage` | 인증 헤더가 있는 HTTP 요청입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-READ-BEARER-01 | 키를 생략한 요청과 정상 키 요청을 비교합니다. | 정상 헤더만 인증 검사로 넘길 값을 제공합니다. | [연결한 검사](../../apps/mcp-server/test/shared-remote.test.ts) |
