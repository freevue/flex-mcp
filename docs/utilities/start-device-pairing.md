# startDevicePairing

[Chrome 등록](../features/browser-pairing.md) · [투두 17](https://github.com/freevue/flex-mcp/issues/17)

코드와 요청 키를 만듭니다. 기존 확장 키가 유효하면 교체할 등록을 저장합니다.

```typescript
declare function startDevicePairing(database: StateDatabase, deviceKey?: string, now?: number): DevicePairingStart | null;
```

| 매개변수 | 설명 |
| --- | --- |
| `database` | 등록 저장소입니다. |
| `deviceKey` | 선택입니다. 교체할 기존 확장 키입니다. |
| `now` | 선택입니다. 밀리초 시각입니다. |

| TC | 조건 | 기대 결과 |
| --- | --- | --- |
| TC-U-START-DEVICE-PAIRING-01 | 유효한 확장 키를 보냅니다. | 등록을 받기 전에는 기존 연결을 유지합니다. |
