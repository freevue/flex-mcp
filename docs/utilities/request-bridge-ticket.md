# requestBridgeTicket

[유틸 목록](../../UTILITIES.md) · [공유 연결 흐름](../features/shared-connection-flow.md)

현재 확장 등록의 접속권을 요청합니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/chrome-extension/src/registration/bridgeApi.ts` |
| 상태 | 구현 |

## 함수 계약

```typescript
declare function requestBridgeTicket(registration: StoredRegistration, signal: AbortSignal, onUnauthorized?: () => void): Promise<string>;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `registration` | `StoredRegistration` | 확장에 저장한 서버 주소, 등록 ID와 확장 키입니다. |
| `signal` | `AbortSignal` | 진행 중인 요청을 중단하는 신호입니다. |

| `onUnauthorized` | `() => void` | 선택입니다. 서버가 확장 키를 401로 거부할 때 한 번 호출합니다. |

## 확인할 경우

`TC-U-REQUEST-BRIDGE-TICKET-01`: 현재 등록의 HTTPS 요청만 사용합니다. 취소 후에는 연결하지 않습니다. [직접 검증 절차](../features/shared-connection-check.md)에서 연결 흐름도 확인합니다.
