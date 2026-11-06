# redeemPairingCode

[유틸 목록](../../UTILITIES.md) · [공유 연결 흐름](../features/shared-connection-flow.md)

코드를 한 번 사용하고 새 등록 ID와 확장 키를 발급합니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/mcp-server/src/registration/pairing.ts` |
| 상태 | 현재 합성 빌드에서 사용 |

이 함수는 호환 API에서 운영자가 발급한 코드를 씁니다. 팝업은 [별도 승인 방식](../features/browser-pairing.md)을 사용합니다.

## 함수 계약

```typescript
declare function redeemPairingCode(database: StateDatabase, code: string, now?: number): BridgeRegistration | null;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `database` | `StateDatabase` | 연결 상태를 저장한 SQLite 데이터베이스입니다. |
| `code` | `string` | 확장이 제출한 등록 코드입니다. |
| `now` | `number` | 선택 항목입니다. 현재 시각을 밀리초로 받습니다. |

## 확인할 경우

`TC-U-REDEEM-PAIRING-CODE-01`: 재사용과 만료를 거부합니다. 새 등록은 해당 사용자의 이전 등록만 폐기합니다. [직접 검증 절차](../features/shared-connection-check.md)에서 연결 흐름도 확인합니다.

[자동 검사](../../apps/mcp-server/test/registration.test.ts)에서 관련 조건을 확인합니다.
