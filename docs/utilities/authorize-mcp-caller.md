# authorizeMcpCaller

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/access-control.md) · [공통 타입](../UTILITY_TYPES.md)

MCP 요청을 보낸 에이전트가 조회할 수 있는지 확인합니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/mcp-server/src/access/authorizeMcpCaller.ts` |
| 상태 | 구현 예정 |
| 출력 | 조회 가능한 호출자 정보입니다. 이 결과만 다음 함수에 전달합니다. |
| 실패 | 호출자를 확인하지 못하면 요청을 거부합니다. 권한이 없으면 확장에 전달하지 않습니다. |

## 함수 계약

```typescript
declare function authorizeMcpCaller(identity: VerifiedCallerIdentity | null, access: AccessState): Outcome<AuthorizedCaller, AccessFailure>;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `identity` | `VerifiedCallerIdentity \| null` | 필수 | 서버가 확인한 에이전트입니다. 확인하지 못했으면 `null`입니다. |
| `access` | `AccessState` | 필수 | 현재 에이전트에게 허용한 범위입니다. |

## 테스트 케이스

아래 조건에서 `authorizeMcpCaller`을 호출합니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-AUTHORIZE-MCP-CALLER-01 | 같은 프로필에 허용된 두 에이전트의 확인된 신원을 각각 넘깁니다. | 각 호출자를 허용합니다. | 예정 |
| TC-U-AUTHORIZE-MCP-CALLER-02 | 신원을 확인하지 못해 `identity`가 `null`입니다. | `CALLER_UNVERIFIED`를 반환합니다. | 예정 |
| TC-U-AUTHORIZE-MCP-CALLER-03 | 신원은 확인했지만 미등록이거나 권한을 회수했습니다. | `ACCESS_DENIED`를 반환합니다. 브라우저 조회를 실행하지 않습니다. | 예정 |
