# issueBridgeTicket

[유틸 목록](../../UTILITIES.md) · [공유 연결 흐름](../features/shared-connection-flow.md)

현재 등록에 30초짜리 접속권을 발급합니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/mcp-server/src/registration/bridgeTickets.ts` |
| 상태 | 구현 |

## 함수 계약

```typescript
declare function issueBridgeTicket(database: StateDatabase, deviceKey: string, now?: number): string | null;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `database` | `StateDatabase` | 연결 상태를 저장한 SQLite 데이터베이스입니다. |
| `deviceKey` | `string` | 확장이 보낸 키입니다. |
| `now` | `number` | 선택 항목입니다. 현재 시각을 밀리초로 받습니다. |

## 확인할 경우

`TC-U-ISSUE-BRIDGE-TICKET-01`: 잘못된 키를 거부합니다. 새 접속권이 이전 미사용 접속권을 바꿉니다. [직접 검증 절차](../features/shared-connection-check.md)에서 연결 흐름도 확인합니다.

[자동 검사](../../apps/mcp-server/test/registration.test.ts)에서 관련 조건을 확인합니다.
