# claimDevicePairing

[유틸 목록](../../UTILITIES.md)

서버는 처음 요청한 확장에 승인된 등록을 반환합니다. 승인 대기 중에는 등록을 발급하지 않습니다. 수령 시점에 승인 권한을 다시 확인합니다.

구현 위치: `apps/mcp-server/src/registration/devicePairing.ts`

```typescript
declare function claimDevicePairing(database: StateDatabase, requestKey: string, now?: number): DevicePairingClaim;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `database` | `StateDatabase` | 등록 상태 저장소입니다. |
| `requestKey` | `string` | 확장만 보관하는 요청 키입니다. |
| `now` | `number` | 선택입니다. 밀리초 시각입니다. 기본값은 `Date.now()`입니다. |

| TC | 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-CLAIM-DEVICE-PAIRING-01 | 승인 전과 승인 뒤에 같은 요청 키를 보냅니다. | 첫 호출은 `pending`입니다. 승인 뒤 첫 호출만 `registered`입니다. | [원격 Node 통합](../../apps/mcp-server/test/shared-remote.test.ts) |
| TC-U-CLAIM-DEVICE-PAIRING-02 | 키가 다르거나, 만료했거나, 승인 권한을 회수했습니다. | `unavailable`입니다. 기존 등록은 유지합니다. | [등록 검사](../../apps/mcp-server/test/registration.test.ts) |
