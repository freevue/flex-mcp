# connectBridge

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/remote-bridge.md) · [공통 타입](../UTILITY_TYPES.md)

확장에서 서버 연결을 열고 끊긴 연결을 다시 엽니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/chrome-extension/src/bridge/connectBridge.ts` |
| 상태 | 구현 예정 |
| 출력 | 연결 상태와 연결 종료 동작입니다. 재연결은 현재 설정에서만 진행합니다. |
| 실패 | 사용자가 연결을 해제하면 재연결을 멈춥니다. 연결이 끊겨도 이전 조회를 다시 실행하지 않습니다. |

## 함수 계약

```typescript
declare function connectBridge(config: BridgeConfig, onRequest: (request: BridgeRequest, signal: AbortSignal) => Promise<BridgeReply>): BridgeControl;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `config` | `BridgeConfig` | 필수 | 운영자가 허용한 서버 주소와 재연결 설정입니다. |
| `onRequest` | `(request: BridgeRequest, signal: AbortSignal) => Promise<BridgeReply>` | 필수 | 검사를 마친 새 조회를 실행하는 함수입니다. 연결이 끊기면 `signal`로 실행을 중단합니다. |

## 테스트 케이스

아래 조건에서 `connectBridge`을 호출합니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-CONNECT-BRIDGE-01 | 승인한 주소로 연결한 뒤 형식이 맞는 새 요청 하나를 받습니다. | 연결 상태를 갱신하고 `onRequest`를 한 번 호출합니다. | 예정 |
| TC-U-CONNECT-BRIDGE-02 | 연결은 열렸지만 받은 메시지에 허용되지 않은 필드가 있습니다. | 메시지를 거부합니다. `onRequest`를 호출하지 않습니다. | 예정 |
| TC-U-CONNECT-BRIDGE-03 | 조회 처리 중 연결을 끊은 뒤 새 연결을 엽니다. | 이전 연결의 요청을 중단합니다. 다시 실행하거나 이전 결과를 전송하지 않습니다. | 예정 |
| TC-U-CONNECT-BRIDGE-04 | 재연결 대기 중 사용자가 연결을 종료합니다. | 예약한 재연결을 중단합니다. | 예정 |
