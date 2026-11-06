# pollDevicePairing

[유틸 목록](../../UTILITIES.md)

확장은 요청 키로 승인 결과를 받습니다.

구현 위치: `apps/chrome-extension/src/registration/devicePairingApi.ts`

```typescript
declare function pollDevicePairing(origin: string, requestKey: string): Promise<DevicePairingClaim>;
```

| 매개변수 | 설명 |
| --- | --- |
| `origin` | 빌드에서 정한 서버 주소 |
| `requestKey` | 팝업에 보내지 않는 요청 키 |

확인할 경우: 서버가 승인하지 않으면 확장 키가 없습니다.

`TC-U-POLL-DEVICE-PAIRING-02`: 추가 요청이 승인되면 `linked`만 받습니다. 등록이나 확장 키를 바꾸지 않습니다.
