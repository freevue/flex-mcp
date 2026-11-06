# findOwner

[서버 함수 목록](../mcp/functions.md) · [createAccessState](create-access-state.md)

에이전트 ID가 속한 사용자를 찾습니다. 연결이 없으면 null입니다. 이 함수는 `createAccessState`가 반환합니다.

```typescript
declare function findOwner(callerId: string): string | null;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `callerId` | `string` | 에이전트 ID입니다. |

| TC | 입력과 조건 | 기대 결과 |
| --- | --- | --- |
| TC-U-FIND-OWNER-01 | 발급한 키의 에이전트와 없는 에이전트를 각각 조회합니다. | 발급한 에이전트의 사용자 ID만 반환합니다. |

[연결한 검사](../../apps/mcp-server/test/registration.test.ts)를 참조합니다.
