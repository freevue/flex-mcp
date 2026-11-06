# verifyDeviceKey

[유틸 목록](../../UTILITIES.md) · [공유 연결 흐름](../features/shared-connection-flow.md)

확장 키가 현재 등록에 속하는지 확인합니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/mcp-server/src/registration/bridgeTickets.ts` |
| 상태 | 구현 |

## 함수 계약

```typescript
declare function verifyDeviceKey(database: DatabaseSync, key: string): BrowserBinding | null;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `database` | `DatabaseSync` | 연결 상태를 저장한 SQLite 데이터베이스입니다. |
| `key` | `string` | 확장이 보낸 키입니다. |

## 확인할 경우

`TC-U-VERIFY-DEVICE-KEY-01`: 다시 등록하거나 해제한 뒤 이전 키를 거부합니다. [직접 검증 절차](../features/shared-connection-check.md)에서 연결 흐름도 확인합니다.

[자동 검사](../../apps/mcp-server/test/registration.test.ts)에서 관련 조건을 확인합니다.
