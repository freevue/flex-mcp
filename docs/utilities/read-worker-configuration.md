# readWorkerConfiguration

[Workers 구현](../mcp/worker-implementation.md) · [소스](../../apps/mcp-server/worker/environment.ts)

확장 ID, 사용자, 키 해시와 승인 권한을 확인합니다. 중복 ID나 키 해시가 있으면 설정을 거부합니다.

```typescript
declare function readWorkerConfiguration(environment: WorkerEnvironment): WorkerConfiguration | null;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `environment` | `WorkerEnvironment` | 현재 Workers 환경 값입니다. |

| TC | 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-READ-WORKER-CONFIGURATION-01 | 같은 키 해시를 가진 두 에이전트의 설정을 줍니다. | null을 반환합니다. Worker는 조회를 열지 않습니다. | 경계 조건 직접 검사 예정 |
