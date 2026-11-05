# resolveBrowserBinding

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/access-control.md) · [공통 타입](../UTILITY_TYPES.md)

확인한 호출자가 조회할 Chrome 프로필을 찾습니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/mcp-server/src/access/resolveBrowserBinding.ts` |
| 상태 | 구현 예정 |
| 출력 | 허용한 Chrome 프로필 하나입니다. |
| 실패 | 연결 관계가 없거나 해제됐으면 접근을 거부합니다. 프로필이 허용됐지만 브라우저가 꺼진 상태는 중계 함수가 구분합니다. |

## 함수 계약

```typescript
declare function resolveBrowserBinding(caller: AuthorizedCaller, access: AccessState): Outcome<BrowserBinding, "ACCESS_DENIED">;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `caller` | `AuthorizedCaller` | 필수 | 서버가 조회를 허용한 에이전트입니다. |
| `access` | `AccessState` | 필수 | 현재 허용한 프로필 연결 관계입니다. |

## 테스트 케이스

아래 조건에서 `resolveBrowserBinding`을 호출합니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-RESOLVE-BROWSER-BINDING-01 | 허용된 에이전트의 프로필 연결 관계가 하나 있습니다. | 서버가 등록한 프로필만 반환합니다. | 예정 |
| TC-U-RESOLVE-BROWSER-BINDING-02 | 이전 권한 확인 뒤 프로필 연결 관계를 해제했습니다. | `ACCESS_DENIED`를 반환합니다. | 예정 |
| TC-U-RESOLVE-BROWSER-BINDING-03 | 프로필 연결 관계는 유효하지만 Chrome이 꺼졌습니다. | 연결 관계를 반환합니다. `BROWSER_OFFLINE`은 중계가 판단합니다. | 예정 |
