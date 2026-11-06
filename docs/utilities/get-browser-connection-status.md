# getBrowserConnectionStatus

[유틸 목록](../../UTILITIES.md) · [내 Chrome 소켓 상태 조회](../features/socket-status.md)

호출자의 권한을 확인하고 현재 등록과 소켓 상태를 읽습니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/mcp-server/src/operations/getBrowserConnectionStatus.ts` |
| 상태 | 구현 |
| 출력 | `unregistered`, `offline`, `online` 중 하나를 담은 객체입니다. |

## 함수 계약

```typescript
declare function getBrowserConnectionStatus(identity: VerifiedCallerIdentity | null, relay: RelayContext): Outcome<BrowserConnectionStatus, AccessFailure>;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `identity` | `VerifiedCallerIdentity \| null` | 서버에서 확인한 호출자입니다. 확인하지 못했으면 `null`입니다. |
| `relay` | `RelayContext` | 현재 권한과 열린 소켓을 관리합니다. |

`TC-U-GET-BROWSER-CONNECTION-STATUS-01`: 자신의 등록을 읽고 그 등록의 소켓만 확인합니다. 등록 없음과 소켓 닫힘을 구분합니다. 호출 권한이 없으면 연결 상태를 반환하지 않습니다.
