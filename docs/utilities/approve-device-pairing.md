# approveDevicePairing

[유틸 목록](../../UTILITIES.md)

서버는 호출자의 승인 권한과 코드를 확인합니다. 코드가 유효하면 호출자의 사용자에게 요청을 묶습니다. 이 함수는 아직 확장 등록을 바꾸지 않습니다.

구현 위치: `apps/mcp-server/src/registration/devicePairing.ts`

```typescript
declare function approveDevicePairing(database: StateDatabase, identity: VerifiedCallerIdentity, code: string, now?: number): boolean;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `database` | `StateDatabase` | 등록 상태 저장소입니다. |
| `identity` | `VerifiedCallerIdentity` | 서버가 확인한 호출자입니다. |
| `code` | `string` | 사용자가 에이전트에 보낸 코드입니다. |
| `now` | `number` | 선택입니다. 밀리초 시각입니다. 기본값은 `Date.now()`입니다. |

| TC | 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-APPROVE-DEVICE-PAIRING-01 | 조회 전용 키 또는 이미 승인한 코드로 요청합니다. | `false`를 반환합니다. 등록을 바꾸지 않습니다. | [원격 Node 통합](../../apps/mcp-server/test/shared-remote.test.ts) |
| TC-U-APPROVE-DEVICE-PAIRING-02 | 만료한 코드로 요청합니다. | 승인하지 않습니다. | [등록 검사](../../apps/mcp-server/test/registration.test.ts) |
