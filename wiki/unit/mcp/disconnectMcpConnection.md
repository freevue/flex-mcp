---
name: disconnectMcpConnection
type: unit
module: mcp
issues: [35]
code: [apps/mcp-server/src/access/disconnectMcpConnection.ts]
---

# disconnectMcpConnection

요청한 MCP 키를 폐기하고 마지막 키일 때 Chrome 등록을 해제합니다.

## 시그니처

<!-- prettier-ignore -->
```typescript
export function disconnectMcpConnection(caller: AuthorizedCaller, database: StateDatabase, relay: RelayContext): Outcome<{ status: "disconnected"; chromeRegistration: "preserved" | "removed" }, "ACCESS_DENIED">
```

| 매개변수 | 타입               | 기본값 | 의미                                         |
| -------- | ------------------ | ------ | -------------------------------------------- |
| caller   | `AuthorizedCaller` | 없음   | 현재 키로 검증한 호출자와 Chrome 등록입니다. |
| database | `StateDatabase`    | 없음   | 연결 상태를 저장하고 트랜잭션을 실행합니다.  |
| relay    | `RelayContext`     | 없음   | 접근 상태와 소켓 및 대기 요청을 관리합니다.  |

| 반환                                                                                                 | 의미                                                                                |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `Outcome<{ status: "disconnected"; chromeRegistration: "preserved" \| "removed" }, "ACCESS_DENIED">` | 키 폐기 결과입니다. 다른 키가 남으면 등록 유지, 마지막 키면 등록 제거를 반환합니다. |

## 내부 로직

1. 트랜잭션에서 호출자 키가 여전히 같은 Chrome 등록에 속하는지 확인합니다. 확인에 실패하면 거부합니다.
2. 해당 호출자의 키와 대기 조회만 폐기합니다.
3. 같은 등록에 다른 키가 남아 있으면 등록 유지로 끝냅니다.
4. 마지막 키를 폐기했으면 Chrome 등록과 연결 자료를 지웁니다. 열려 있는 소켓을 닫고 등록 제거를 반환합니다.

## 사용법

```typescript
const result = disconnectMcpConnection(caller, database, relay);
```

## 사용처

| 위치                                                            | 용도                                    |
| --------------------------------------------------------------- | --------------------------------------- |
| [내 MCP 연결 해제](../../feature/flex-disconnect-connection.md) | 승인 키가 가리키는 호출자만 해제합니다. |

## TC

| ID                            | 조건                                                                      | 기대 결과                             |
| ----------------------------- | ------------------------------------------------------------------------- | ------------------------------------- |
| UT-disconnectMcpConnection-01 | 두 키가 공유하는 소켓에 첫 키의 대기 조회가 있습니다. 첫 키를 폐기합니다. | 첫 키의 조회만 접근 거부로 끝납니다.  |
| UT-disconnectMcpConnection-02 | 마지막 키로 등록을 해제합니다.                                            | 서버가 등록을 지우고 소켓을 닫습니다. |
