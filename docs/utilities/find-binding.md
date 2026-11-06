# findBinding

[서버 함수 목록](../mcp/functions.md) · [createAccessState](create-access-state.md)

사용자의 현재 Chrome 등록을 찾습니다. 등록이 없으면 null입니다. 이 함수는 `createAccessState`가 반환합니다.

```typescript
declare function findBinding(ownerId: string): BrowserBinding | null;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `ownerId` | `string` | 서버가 확인한 사용자 ID입니다. |

| TC | 입력과 조건 | 기대 결과 |
| --- | --- | --- |
| TC-U-FIND-BINDING-01 | 서로 다른 사용자의 등록을 조회합니다. | 각 사용자의 등록만 반환합니다. |

[연결한 검사](../../apps/mcp-server/test/registration.test.ts)를 참조합니다.
