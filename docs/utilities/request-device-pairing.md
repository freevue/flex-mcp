# requestDevicePairing

[유틸 목록](../../UTILITIES.md)

확장은 배포 서버에서 승인 코드를 받습니다.

구현 위치: `apps/chrome-extension/src/registration/devicePairingApi.ts`

```typescript
declare function requestDevicePairing(origin: string, deviceKey?: string, invite?: boolean): Promise<DevicePairingStart>;
```

| 매개변수 | 설명 |
| --- | --- |
| `origin` | 빌드에서 정한 서버 주소입니다. |
| `deviceKey` | 기존 등록을 교체하거나 같은 채널에 에이전트를 추가할 때 보냅니다. |
| `invite` | 기본값은 `false`입니다. `true`이면 기존 채널에 새 에이전트를 추가합니다. |

`TC-U-REQUEST-DEVICE-PAIRING-01`: 응답 형식이 다르면 코드를 표시하지 않습니다.

`TC-U-REQUEST-DEVICE-PAIRING-02`: 현재 확장 키를 보내 교체를 요청합니다. 새 등록을 수령하기 전까지 기존 연결 키가 유지됩니다. [서버 검사](../../apps/mcp-server/test/registration.test.ts)에서 교체 동작을 확인합니다.

`TC-U-REQUEST-DEVICE-PAIRING-03`: `invite`가 참이면 확장 키를 보내고 추가 코드를 받습니다. 기존 등록은 유지됩니다.
