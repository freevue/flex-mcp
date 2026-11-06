# removeCaller

[서버 함수 목록](../mcp/functions.md) · [createAccessState](create-access-state.md)

사용자와 에이전트 ID가 모두 일치하는 행을 지웁니다. 지운 행이 있으면 true입니다. 이 함수는 `createAccessState`가 반환합니다.

```typescript
declare function removeCaller(ownerId: string, callerId: string): boolean;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `ownerId` | `string` | 서버에서 확인한 사용자입니다. |
| `callerId` | `string` | 회수할 에이전트 ID입니다. |

| TC | 입력과 조건 | 기대 결과 |
| --- | --- | --- |
| TC-U-REMOVE-CALLER-01 | 사용자에 속한 에이전트의 권한을 회수합니다. | 기존 키는 다음 인증을 통과하지 못합니다. |

[연결한 검사](../../apps/mcp-server/test/registration.test.ts)를 참조합니다.
