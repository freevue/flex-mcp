# initializeStateDatabase

[Workers 구현](../mcp/worker-implementation.md) · [소스](../../apps/mcp-server/src/registration/stateDatabase.ts)

승인 요청, 연결 키 해시, Chrome 등록과 접속권 테이블을 준비합니다. 이전 테이블은 보존합니다.

```typescript
declare function initializeStateDatabase(database: StateDatabase): void;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `database` | `StateDatabase` | Node 또는 Durable Object 저장소입니다. |

| TC | 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-INITIALIZE-STATE-DATABASE-01 | 같은 저장소에서 초기화를 반복합니다. | 기존 등록을 유지하고 테이블을 사용할 수 있습니다. | Worker 테스트에서 첫 실행을 확인. 반복 저장소 직접 검사 예정 |
