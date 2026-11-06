# reply

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/createMcpServer.ts)

서버 내부 함수입니다. 조회 입력을 만든 뒤 핸들러를 호출합니다. 입력 오류, 미연결, 중계 오류와 성공을 도구 응답으로 바꿉니다.

```typescript
declare function reply(buildQuery: () => FlexQuery, connectionKey?: string): Promise<CallToolResult>;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `buildQuery` | `() => FlexQuery` | 기간과 조회 종류를 확인해 요청을 만드는 함수입니다. |
| `connectionKey` | `string` | 선택입니다. 원격 조회의 연결 키를 조회 핸들러에 전달합니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-REPLY-01 | 32일 범위로 호출합니다. | 오류를 반환합니다. 조회 핸들러를 호출하지 않습니다. | [연결한 검사](../../apps/mcp-server/test/query-integration.test.ts) |
| TC-U-REPLY-02 | 조회 핸들러가 예외를 던집니다. | FLEX_READ_FAILED를 반환합니다. | 직접 자동 검사 예정 |
