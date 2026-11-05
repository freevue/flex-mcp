# readAnnualLeave

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/annual-leave.md) · [공통 타입](../UTILITY_TYPES.md)

확인이 끝난 현재 계정의 연차를 조회합니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/chrome-extension/src/flex/readAnnualLeave.ts` |
| 상태 | 구현 |
| 출력 | [연차 결과](../features/annual-leave.md)입니다. `readFlexJson`으로 읽고 `parseAnnualLeave`로 필요한 필드만 반환합니다. |
| 실패 | 승인된 조회를 완료하지 못하면 값을 반환하지 않습니다. 다시 로그인, 기록 없음, 조회 실패를 구분합니다. |

## 함수 계약

```typescript
declare function readAnnualLeave(context: FlexPageContext, user: BrowserUser, asOf: Date, signal: AbortSignal): Promise<Outcome<AnnualLeaveResult, FlexReadFailure>>;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `context` | `FlexPageContext` | 필수 | 연차 요청을 실행할 flex 탭의 문맥입니다. |
| `user` | `BrowserUser` | 필수 | 같은 탭에서 확인한 현재 계정입니다. |
| `asOf` | `Date` | 필수 | 조회 시각으로 기록할 유효한 시각입니다. |
| `signal` | `AbortSignal` | 필수 | 연차 조회를 중단할 때 쓰는 신호입니다. |

## 테스트 케이스

아래 조건에서 `readAnnualLeave`을 호출합니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-READ-ANNUAL-LEAVE-01 | 현재 계정이 확인됐고 읽기 함수가 정상 합성 잔액을 반환합니다. | 현재 계정으로 연차만 읽습니다. 정한 세 결과 필드만 반환합니다. | [로컬 테스트](../../apps/chrome-extension/test/flex.test.ts) |
| TC-U-READ-ANNUAL-LEAVE-02 | 읽기 함수가 `FLEX_REAUTH_REQUIRED`를 반환합니다. | 같은 오류를 반환합니다. 잔액 변환을 실행하지 않습니다. | [로컬 테스트](../../apps/chrome-extension/test/flex.test.ts) |
| TC-U-READ-ANNUAL-LEAVE-03 | 읽기는 성공했지만 응답이 기록 없음으로 확인됩니다. | `FLEX_NO_RECORDS`를 반환합니다. 빈 성공 값은 만들지 않습니다. | [로컬 테스트](../../apps/chrome-extension/test/flex.test.ts) |
