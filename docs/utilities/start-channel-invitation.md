# startChannelInvitation

[Chrome 등록](../features/browser-pairing.md) · [유틸 목록](../../UTILITIES.md)

현재 Chrome 채널에 클라이언트를 추가할 코드를 발급합니다. 코드는 5분 동안 유효합니다. 새 코드가 발급돼도 등록과 기존 연결 키는 유지됩니다.

```typescript
declare function startChannelInvitation(database: StateDatabase, deviceKey: string, now?: number):
  Outcome<DevicePairingStart, "INVALID_DEVICE_KEY" | "PAIRING_LIMIT">;
```

| 매개변수 | 설명 |
| --- | --- |
| `database` | 채널 등록 저장소입니다. |
| `deviceKey` | 현재 채널의 확장 키입니다. |
| `now` | 선택입니다. 현재 시각을 밀리초로 받습니다. |

| TC | 조건 | 기대 결과 |
| --- | --- | --- |
| TC-U-START-CHANNEL-INVITATION-01 | 유효한 확장 키를 보냅니다. | 코드와 요청 키를 반환합니다. 기존 채널을 유지합니다. |
| TC-U-START-CHANNEL-INVITATION-02 | 연결 키를 확장 키 대신 보냅니다. | `INVALID_DEVICE_KEY`를 반환합니다. |
| TC-U-START-CHANNEL-INVITATION-03 | 5분이 지난 코드를 승인합니다. | 추가 연결 키를 발급하지 않습니다. |
