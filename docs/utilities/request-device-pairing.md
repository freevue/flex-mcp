# requestDevicePairing

[유틸 목록](../../UTILITIES.md)

확장은 배포 서버에서 승인 코드를 받습니다.

구현 위치: `apps/chrome-extension/src/registration/devicePairingApi.ts`

```typescript
declare function requestDevicePairing(origin: string): Promise<DevicePairingStart>;
```

| 매개변수 | 설명 |
| --- | --- |
| `origin` | 빌드에서 정한 서버 주소 |

확인할 경우: 응답 형식이 다르면 코드를 표시하지 않습니다.
