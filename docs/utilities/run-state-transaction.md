# runStateTransaction

[Workers 구현](../mcp/worker-implementation.md) · [소스](../../apps/mcp-server/src/registration/stateDatabase.ts)

저장 작업을 함께 반영합니다. Durable Object는 transactionSync를 사용합니다. Node는 BEGIN, COMMIT, ROLLBACK을 사용합니다.

```typescript
declare function runStateTransaction<Result>(database: StateDatabase, operation: () => Result): Result;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `database` | `StateDatabase` | 작업을 처리할 저장소입니다. |
| `operation` | `() => Result` | 함께 반영할 동기 작업입니다. |

| TC | 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-RUN-STATE-TRANSACTION-01 | 승인 결과를 처음 수령한 뒤 같은 키를 다시 사용합니다. | 요청 소비와 등록 교체가 한 번만 완료됩니다. | 로컬 Workers 통합 |
