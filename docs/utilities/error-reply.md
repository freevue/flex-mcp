# errorReply

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/createMcpServer.ts)

서버 내부 함수입니다. 도구 오류에 isError와 안내 문구를 넣습니다. 오류 코드가 있으면 구조화 응답에도 넣습니다.

```typescript
declare function errorReply(text: string, code?: ToolFailure): CallToolResult;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `text` | `string` | 호출자에게 보여 줄 안내입니다. |
| `code` | `ToolFailure` | 선택입니다. 서버가 분류한 오류 코드입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-ERROR-REPLY-01 | 코드가 있는 권한 오류와 코드가 없는 미연결 오류를 확인합니다. | 권한 오류에만 구조화 코드를 넣습니다. | [연결한 검사](../../apps/mcp-server/test/query-integration.test.ts) |
| TC-U-ERROR-REPLY-02 | 연결을 구성하지 않은 도구를 호출합니다. | 문구를 반환하고 구조화 결과는 만들지 않습니다. | [연결한 검사](../../apps/mcp-server/test/public-server.test.ts) |
