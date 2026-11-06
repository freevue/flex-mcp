# createRemoteServer

[유틸 목록](../../UTILITIES.md) · [공유 연결 흐름](../features/shared-connection-flow.md)

하나의 서버에 MCP와 확장 연결을 설정합니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/mcp-server/src/remote/createRemoteServer.ts` |
| 상태 | 구현 |

## 함수 계약

```typescript
declare function createRemoteServer(configuration: RemoteConfiguration, database: DatabaseSync): Server;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `configuration` | `RemoteConfiguration` | 공개 서버 주소와 허용한 확장 ID입니다. |
| `database` | `DatabaseSync` | 연결 상태를 저장한 SQLite 데이터베이스입니다. |

## 확인할 경우

`TC-U-CREATE-REMOTE-SERVER-01`: 허용한 확장만 소켓을 열고 서로 다른 사용자 요청을 분리합니다. [직접 검증 절차](../features/shared-connection-check.md)에서 연결 흐름도 확인합니다.

[자동 검사](../../apps/mcp-server/test/shared-remote.test.ts)에서 관련 조건을 확인합니다.
