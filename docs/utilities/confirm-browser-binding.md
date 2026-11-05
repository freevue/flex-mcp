# confirmBrowserBinding

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/extension-setup.md) · [공통 타입](../UTILITY_TYPES.md)

사용자가 확인한 Chrome 프로필과 flex 계정을 확장에 기록합니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/chrome-extension/src/bridge/confirmBrowserBinding.ts` |
| 상태 | 구현 예정 |
| 출력 | 이후 조회에서 계정을 대조할 수 있는 확장 내부 연결 정보입니다. |
| 실패 | 사용자 확인이 없거나 현재 계정을 확인할 수 없으면 연결을 저장하지 않습니다. |

## 함수 계약

```typescript
declare function confirmBrowserBinding(confirmed: boolean, approved: ApprovedBrowserTarget, currentUser: Outcome<BrowserUser, FlexRequestFailure>): Outcome<LocalBrowserBinding, BindingFailure>;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `confirmed` | `boolean` | 필수 | 사용자가 선택한 프로필 연결을 확인했는지 나타냅니다. |
| `approved` | `ApprovedBrowserTarget` | 필수 | 서버가 확장에 허용한 프로필입니다. |
| `currentUser` | `Outcome<BrowserUser, FlexRequestFailure>` | 필수 | 선택한 탭에서 현재 계정을 확인한 결과입니다. |

## 테스트 케이스

아래 조건에서 `confirmBrowserBinding`을 호출합니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-CONFIRM-BROWSER-BINDING-01 | 사용자가 연결을 확인했고, 서버가 허용한 프로필에서 현재 계정을 확인했습니다. | 이후에 같은 계정인지 비교할 로컬 연결 정보를 반환합니다. | 예정 |
| TC-U-CONFIRM-BROWSER-BINDING-02 | 사용자가 연결을 취소해 `confirmed`가 `false`입니다. | `BINDING_CANCELLED`를 반환합니다. 연결 대상은 바뀌지 않습니다. | 예정 |
| TC-U-CONFIRM-BROWSER-BINDING-03 | 사용자는 확인했지만 flex가 다시 로그인을 요구합니다. | `FLEX_REAUTH_REQUIRED`를 반환합니다. 연결을 저장하지 않습니다. | 예정 |
