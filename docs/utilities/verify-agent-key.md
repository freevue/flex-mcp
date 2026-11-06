# verifyAgentKey

[유틸 목록](../../UTILITIES.md) · [공유 연결 흐름](../features/shared-connection-flow.md)

키를 확인하고 호출자와 사용자 ID를 찾습니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/mcp-server/src/registration/agentKeys.ts` |
| 상태 | 계약 |

## 함수 계약

```typescript
declare function verifyAgentKey(database: DatabaseSync, key: string): VerifiedCallerIdentity | null;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `database` | `DatabaseSync` | 연결 상태를 저장한 SQLite 데이터베이스입니다. |
| `key` | `string` | 에이전트가 보낸 키입니다. |

## 확인할 경우

다른 사용자의 권한을 얻거나 해제한 키를 쓸 수 없습니다. [직접 검증 절차](../features/shared-connection-check.md)에서 연결 흐름도 확인합니다.
