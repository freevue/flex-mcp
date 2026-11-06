# consumeBridgeTicket

[유틸 목록](../../UTILITIES.md) · [공유 연결 흐름](../features/shared-connection-flow.md)

접속권을 한 번 사용하고 연결할 등록을 찾습니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/mcp-server/src/registration/bridgeTickets.ts` |
| 상태 | 계약 |

## 함수 계약

```typescript
declare function consumeBridgeTicket(database: DatabaseSync, ticket: string, now?: number): BrowserBinding | null;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `database` | `DatabaseSync` | 연결 상태를 저장한 SQLite 데이터베이스입니다. |
| `ticket` | `string` | 소켓의 첫 메시지에 담긴 접속권입니다. |
| `now` | `number` | 선택 항목입니다. 현재 시각을 밀리초로 받습니다. |

## 확인할 경우

만료, 재사용, 해제한 등록의 접속권을 거부합니다. [직접 검증 절차](../features/shared-connection-check.md)에서 연결 흐름도 확인합니다.
