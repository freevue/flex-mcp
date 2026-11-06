# removeBinding

[서버 함수 목록](../mcp/functions.md) · [createAccessState](create-access-state.md)

사용자와 등록 ID가 모두 일치하는 Chrome 등록을 지웁니다. 지운 행이 있으면 true입니다. 이 함수는 `createAccessState`가 반환합니다.

```typescript
declare function removeBinding(ownerId: string, bindingId: string): boolean;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `ownerId` | `string` | 서버에서 확인한 사용자입니다. |
| `bindingId` | `string` | 해제할 Chrome 등록 ID입니다. |

| TC | 입력과 조건 | 기대 결과 |
| --- | --- | --- |
| TC-U-REMOVE-BINDING-01 | 한 사용자의 등록을 해제하고 다른 사용자의 연결을 확인합니다. | 해제한 등록만 사라집니다. |

[연결한 검사](../../apps/mcp-server/test/shared-remote.test.ts)를 참조합니다.
