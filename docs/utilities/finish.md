# finish

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/bridge/forwardFlexQuery.ts)

중계 요청의 내부 함수입니다. 대기 요청을 한 번만 지웁니다. 타이머를 지우고 결과를 전달합니다.

```typescript
declare function finish(outcome: Outcome<FlexResult, RelayFailure>): void;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `outcome` | `Outcome<FlexResult, RelayFailure>` | 검증한 성공 결과 또는 오류입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-FINISH-01 | 같은 요청에 응답을 두 번 보냅니다. | 첫 유효 결과만 사용합니다. | [연결한 검사](../../apps/mcp-server/test/relay.test.ts) |
| TC-U-FINISH-02 | 응답보다 타이머가 먼저 끝납니다. | 늦은 응답을 버립니다. | [연결한 검사](../../apps/mcp-server/test/relay.test.ts) |
