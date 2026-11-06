# replaceBrowserRegistration

[유틸 목록](../../UTILITIES.md) · [최초 등록](../features/browser-pairing.md)

사용자의 이전 등록을 지우고 새 등록 ID와 확장 키를 발급합니다. 등록을 지울 때 이전 접속권도 지워집니다. 호출자는 이 함수와 등록 요청 소비를 같은 트랜잭션에서 실행합니다.

```typescript
declare function replaceBrowserRegistration(database: StateDatabase, ownerId: string): BridgeRegistration;
```

| 매개변수 | 설명 |
| --- | --- |
| `database` | 등록 상태 저장소입니다. |
| `ownerId` | 서버가 확인한 등록 소유자입니다. |

| TC | 조건 | 기대 결과 |
| --- | --- | --- |
| TC-U-REPLACE-REGISTRATION-01 | 등록과 접속권이 있는 사용자가 새 등록을 받습니다. | 새 등록을 반환하고 이전 키와 접속권을 거부합니다. |

[자동 검사](../../apps/mcp-server/test/registration.test.ts)에서 확인합니다.
