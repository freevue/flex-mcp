# isBridgeError

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/bridge/parseBridgeReply.ts)

응답 검사 내부 함수입니다. 공통 계약에 정의한 브라우저 오류만 받습니다.

```typescript
declare function isBridgeError(value: unknown): value is BridgeError;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `unknown` | 브라우저가 보낸 오류 값입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-IS-BRIDGE-ERROR-01 | 공통 코드와 정의하지 않은 코드를 각각 보냅니다. | 공통 코드만 true입니다. | 직접 자동 검사 예정 |
