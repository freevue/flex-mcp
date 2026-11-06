# requestDevicePairing

[유틸 목록](../../UTILITIES.md)

확장은 배포 서버에서 승인 코드를 받습니다.

구현 위치: `apps/chrome-extension/src/registration/devicePairingApi.ts`

```typescript
declare function requestDevicePairing(origin: string, deviceKey?: string): Promise<DevicePairingStart>;
```

| 매개변수 | 설명 |
| --- | --- |
| `origin` | 빌드에서 정한 서버 주소입니다. |
| `deviceKey` | 선택입니다. 같은 서버의 기존 등록을 교체할 때 보냅니다. |

`TC-U-REQUEST-DEVICE-PAIRING-01`: 응답 형식이 다르면 코드를 표시하지 않습니다.

`TC-U-REQUEST-DEVICE-PAIRING-02`: 현재 확장 키를 보내 교체를 요청합니다. 새 등록을 수령하기 전까지 기존 연결 키가 유지됩니다. [서버 검사](../../apps/mcp-server/test/registration.test.ts)에서 교체 동작을 확인합니다.
