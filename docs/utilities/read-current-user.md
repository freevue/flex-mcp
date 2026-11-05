# readCurrentUser

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/access-control.md) · [공통 타입](../UTILITY_TYPES.md)

현재 flex 탭의 계정을 확인합니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/chrome-extension/src/flex/readCurrentUser.ts` |
| 상태 | 구현 예정 |
| 출력 | 확장 안에서 비교할 현재 사용자 식별자입니다. 서버와 로그에는 보내지 않습니다. |
| 실패 | flex가 로그인을 요구하면 `FLEX_REAUTH_REQUIRED`를 반환합니다. 계정 응답의 형태를 알 수 없으면 `FLEX_READ_FAILED`를 반환합니다. |

## 함수 계약

```typescript
declare function readCurrentUser(context: FlexPageContext, signal: AbortSignal): Promise<Outcome<BrowserUser, FlexRequestFailure>>;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `context` | `FlexPageContext` | 필수 | 계정을 확인할 flex 탭의 문맥입니다. |
| `signal` | `AbortSignal` | 필수 | 계정 확인을 중단할 때 쓰는 신호입니다. |

## 테스트 케이스

아래 조건에서 `readCurrentUser`을 호출합니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-READ-CURRENT-USER-01 | 합성 응답에 현재 계정 식별자와 표시 이름이 있습니다. | 계정 비교에 필요한 `BrowserUser`만 반환합니다. | 예정 |
| TC-U-READ-CURRENT-USER-02 | flex가 다시 로그인을 요구합니다. | `FLEX_REAUTH_REQUIRED`를 반환합니다. | 예정 |
| TC-U-READ-CURRENT-USER-03 | 로그인 요구 없이 필수 계정 식별자가 빠져 있습니다. | `FLEX_READ_FAILED`를 반환합니다. 로그인 만료로 표시하지 않습니다. | 예정 |
