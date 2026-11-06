# createWorkerDatabase

[Workers 구현](../mcp/worker-implementation.md) · [소스](../../apps/mcp-server/worker/environment.ts)

Durable Object 저장소의 SQL을 공통 상태 저장소에 연결합니다. 쓴 행의 수와 첫 행을 전달합니다.

```typescript
declare function createWorkerDatabase(storage: DurableObjectStorage): StateDatabase;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `storage` | `DurableObjectStorage` | 현재 객체에 속한 SQLite 저장소입니다. |

| TC | 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-CREATE-WORKER-DATABASE-01 | 키 발급을 설정한 뒤 승인과 수령을 실행합니다. | 저장소에서 현재 사용자와 승인 요청을 찾습니다. | 로컬 Workers 통합 |
