# syncWorkerAgents

[Workers 구현](../mcp/worker-implementation.md) · [소스](../../apps/mcp-server/worker/environment.ts)

권한 설정을 저장합니다. 설정이 같으면 다시 쓰지 않습니다. 승인 권한을 잃은 요청을 제거합니다.

```typescript
declare function syncWorkerAgents(database: StateDatabase, agents: readonly AgentConfiguration[]): void;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `database` | `StateDatabase` | Durable Object의 SQLite 저장소입니다. |
| `agents` | `readonly AgentConfiguration[]` | 검증을 마친 에이전트 설정입니다. |

| TC | 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-SYNC-WORKER-AGENTS-01 | 조회 전용 키와 승인 키를 설정합니다. | 승인 권한이 있는 키만 팝업 코드를 승인할 수 있습니다. | 로컬 Workers 통합 |
