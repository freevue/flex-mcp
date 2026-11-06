# isResult

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/bridge/parseBridgeReply.ts)

응답 검사 내부 함수입니다. 조회 종류에 맞는 필드만 받습니다. 일정과 근무는 요청한 기간과 시간대를 확인합니다.

```typescript
declare function isResult(value: unknown, query: FlexQuery): value is FlexResult;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `unknown` | 브라우저에서 받은 결과입니다. |
| `query` | `FlexQuery` | 서버가 보낸 요청입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-IS-RESULT-01 | 근무 요청에 연차 응답을 보냅니다. | false를 반환합니다. | [연결한 검사](../../apps/mcp-server/test/relay.test.ts) |
