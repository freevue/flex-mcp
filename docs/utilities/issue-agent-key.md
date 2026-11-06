# issueAgentKey

[유틸 목록](../../UTILITIES.md) · [공유 연결 흐름](../features/shared-connection-flow.md)

사용자 한 명에게만 쓸 에이전트 키를 발급합니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/mcp-server/src/registration/agentKeys.ts` |
| 상태 | 계약 |

## 함수 계약

```typescript
declare function issueAgentKey(database: DatabaseSync, ownerId: string): { callerId: string; key: string };
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `database` | `DatabaseSync` | 연결 상태를 저장한 SQLite 데이터베이스입니다. |
| `ownerId` | `string` | 운영자가 지정한 사용자 ID입니다. |

## 확인할 경우

키 두 개를 발급해 각각 별도 호출자로 확인합니다. [직접 검증 절차](../features/shared-connection-check.md)에서 연결 흐름도 확인합니다.
