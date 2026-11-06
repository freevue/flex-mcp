# hasKeys

[서버 함수 목록](../mcp/functions.md) · [구현](../../shared/validation.ts)

객체에 허용한 자체 키만 있는지 확인합니다. 키 하나가 빠지거나 더 있으면 false입니다.

```typescript
declare function hasKeys(value: Record<string, unknown>, keys: readonly string[]): boolean;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `Record<string, unknown>` | 확인할 객체입니다. |
| `keys` | `readonly string[]` | 정확히 허용한 필드 이름입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-HAS-KEYS-01 | 근무 응답에 계약 밖 필드를 추가합니다. | 응답을 거부합니다. | [연결한 검사](../../apps/mcp-server/test/relay.test.ts) |
