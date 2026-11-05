# revokeAccess

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/access-control.md) · [공통 타입](../UTILITY_TYPES.md)

에이전트 권한이나 프로필 연결을 해제합니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/mcp-server/src/access/revokeAccess.ts` |
| 상태 | 구현 예정 |
| 출력 | 대상의 새 조회를 막고 대기 중인 결과를 폐기합니다. 다른 에이전트의 권한은 그대로 둡니다. |
| 실패 | 소유자가 아니거나 해제 대상을 확인할 수 없으면 상태를 바꾸지 않습니다. |

## 함수 계약

```typescript
declare function revokeAccess(owner: VerifiedOwnerIdentity | null, target: RevocationTarget, access: AccessState, registry: BridgeRegistry): Outcome<void, "ACCESS_DENIED">;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `owner` | `VerifiedOwnerIdentity \| null` | 필수 | 서버가 확인한 소유자입니다. 확인하지 못했으면 `null`입니다. |
| `target` | `RevocationTarget` | 필수 | 해제할 에이전트나 프로필입니다. |
| `access` | `AccessState` | 필수 | 해제 여부를 반영할 현재 접근 상태입니다. |
| `registry` | `BridgeRegistry` | 필수 | 대기 요청을 끝낼 연결과 요청 상태입니다. |

## 테스트 케이스

아래 조건에서 `revokeAccess`을 호출합니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-REVOKE-ACCESS-01 | 소유자가 조회 중인 에이전트 하나의 권한을 해제합니다. | 해당 에이전트의 새 요청을 거부합니다. 대기 결과는 보내지 않습니다. 다른 에이전트는 유지합니다. | 예정 |
| TC-U-REVOKE-ACCESS-02 | 소유자가 두 에이전트가 쓰는 프로필 연결을 해제합니다. | 두 에이전트의 새 조회를 막습니다. 대기 중인 두 결과도 폐기합니다. | 예정 |
| TC-U-REVOKE-ACCESS-03 | 소유자가 아니거나 해제 대상을 확인할 수 없습니다. | `ACCESS_DENIED`를 반환합니다. 접근 상태와 대기 요청을 바꾸지 않습니다. | 예정 |
