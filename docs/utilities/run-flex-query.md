# runFlexQuery

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/annual-leave.md) · [공통 타입](../UTILITY_TYPES.md)

읽기 요청 하나를 도구에 맞는 함수로 보냅니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/chrome-extension/src/flex/runFlexQuery.ts` |
| 상태 | 구현 예정 |
| 출력 | 연차, 일정, 근무 시간 중 해당 도구의 결과입니다. flex 내부 식별자를 제거합니다. |
| 실패 | 현재 계정이 연결 계정과 다르면 `FLEX_ACCOUNT_MISMATCH`입니다. 사용자가 연결을 해제하거나 조회 중 대상이 바뀌면 결과를 반환하지 않습니다. |

## 함수 계약

```typescript
declare function runFlexQuery(context: FlexPageContext, query: FlexQuery, binding: LocalBrowserBinding, signal: AbortSignal): Promise<Outcome<FlexResult, BrowserQueryFailure>>;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `context` | `FlexPageContext` | 필수 | 조회할 flex 탭의 문맥입니다. |
| `query` | `FlexQuery` | 필수 | 도구 종류와 필요한 기간을 확인한 조회 요청입니다. |
| `binding` | `LocalBrowserBinding` | 필수 | 현재 탭의 계정과 비교할 로컬 연결 정보입니다. |
| `signal` | `AbortSignal` | 필수 | 대상이 바뀌거나 조회를 중단할 때 쓰는 신호입니다. |

## 테스트 케이스

아래 조건에서 `runFlexQuery`을 호출합니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-RUN-FLEX-QUERY-01 | 현재 계정과 연결한 계정이 같습니다. 세 조회 종류를 각각 호출합니다. | 종류마다 지정한 읽기 함수 하나만 실행합니다. 결과에 내부 식별자를 넣지 않습니다. | 예정 |
| TC-U-RUN-FLEX-QUERY-02 | 현재 flex 계정이 연결 당시 계정과 다릅니다. | `FLEX_ACCOUNT_MISMATCH`를 반환합니다. 도구 조회는 시작하지 않습니다. | 예정 |
| TC-U-RUN-FLEX-QUERY-03 | 계정 확인이 `FLEX_REAUTH_REQUIRED`로 실패합니다. | 같은 오류를 반환합니다. 도구 조회는 시작하지 않습니다. | 예정 |
| TC-U-RUN-FLEX-QUERY-04 | 읽는 동안 계정이 바뀌거나 연결이 해제됩니다. | 완료된 응답이 있더라도 결과를 반환하지 않습니다. | 예정 |
