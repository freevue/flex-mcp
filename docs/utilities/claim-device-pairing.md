# claimDevicePairing

[Chrome 등록](../features/browser-pairing.md) · [투두 17](https://github.com/freevue/flex-mcp/issues/17)

요청 키로 처음 요청한 확장을 확인합니다. 처음 등록이면 승인된 요청을 소비하고 새 등록에 연결 키 해시를 붙입니다. 에이전트를 추가한 요청이면 `linked`만 반환합니다.

```typescript
declare function claimDevicePairing(database: StateDatabase, requestKey: string, now?: number): DevicePairingClaim;
```

| 매개변수 | 설명 |
| --- | --- |
| `database` | 등록 저장소입니다. |
| `requestKey` | 처음 확장이 받은 요청 키입니다. |
| `now` | 선택입니다. 밀리초 시각입니다. |

| TC | 조건 | 기대 결과 |
| --- | --- | --- |
| TC-U-CLAIM-DEVICE-PAIRING-01 | 유효한 키로 등록을 수령하고 다시 요청합니다. | 첫 요청만 등록을 반환합니다. |
| TC-U-CLAIM-DEVICE-PAIRING-02 | 승인된 추가 요청의 키로 조회합니다. | 처음 호출은 `linked`입니다. 다시 호출하면 `unavailable`입니다. |
