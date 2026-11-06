# startDevicePairing

[유틸 목록](../../UTILITIES.md)

서버는 승인 코드와 비공개 요청 키를 만듭니다. 요청은 5분 동안 유효합니다. 만료한 요청을 지운 뒤 대기 건수를 확인합니다.

구현 위치: `apps/mcp-server/src/registration/devicePairing.ts`

```typescript
declare function startDevicePairing(database: StateDatabase, now?: number): DevicePairingStart | null;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `database` | `StateDatabase` | 등록 상태 저장소입니다. |
| `now` | `number` | 선택입니다. 밀리초 시각입니다. 기본값은 `Date.now()`입니다. |

| TC | 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-START-DEVICE-PAIRING-01 | 승인 요청을 시작합니다. | 코드, 요청 키와 만료 시각을 반환합니다. | [원격 Node 통합](../../apps/mcp-server/test/shared-remote.test.ts) |
| TC-U-START-DEVICE-PAIRING-02 | 만료하지 않은 대기 요청이 128건입니다. | 새 요청을 발급하지 않고 `null`을 반환합니다. | 상한 직접 검사 예정 |
