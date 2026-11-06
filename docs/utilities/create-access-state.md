# createAccessState

[유틸 목록](../../UTILITIES.md) · [공유 연결 흐름](../features/shared-connection-flow.md)

서버가 사용자별로 현재 권한과 등록을 찾도록 연결합니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/mcp-server/src/registration/accessState.ts` |
| 상태 | 구현 |

## 함수 계약

```typescript
declare function createAccessState(database: DatabaseSync): AccessState;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `database` | `DatabaseSync` | 연결 상태를 저장한 SQLite 데이터베이스입니다. |

## 확인할 경우

`TC-U-CREATE-ACCESS-STATE-01`: 같은 조회 서버에서 서로 다른 사용자 두 명의 등록을 구분합니다. [직접 검증 절차](../features/shared-connection-check.md)에서 연결 흐름도 확인합니다.

[자동 검사](../../apps/mcp-server/test/registration.test.ts)에서 관련 조건을 확인합니다.
