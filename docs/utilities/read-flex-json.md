# readFlexJson

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/annual-leave.md) · [공통 타입](../UTILITY_TYPES.md)

flex 탭 안에서 확장에 정의된 읽기 요청을 보냅니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/chrome-extension/src/flex/readFlexJson.ts` |
| 상태 | 구현 예정 |
| 출력 | flex에서 받은 JSON 객체입니다. 원본은 탭의 조회 코드 안에서만 사용합니다. |
| 실패 | 다시 로그인이 필요하면 `FLEX_REAUTH_REQUIRED`를 반환합니다. 응답이나 요청이 정한 조건을 벗어나면 `FLEX_READ_FAILED`를 반환합니다. |

## 함수 계약

```typescript
declare function readFlexJson(context: FlexPageContext, request: FlexReadRequest, signal: AbortSignal): Promise<Outcome<Record<string, unknown>, FlexRequestFailure>>;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `context` | `FlexPageContext` | 필수 | 선택한 flex 탭에서만 요청을 보낼 수 있는 문맥입니다. |
| `request` | `FlexReadRequest` | 필수 | 확장에 정의된 읽기 종류와 해당 조회 값입니다. |
| `signal` | `AbortSignal` | 필수 | 대기 중인 요청을 중단할 때 쓰는 신호입니다. |

## 테스트 케이스

아래 조건에서 `readFlexJson`을 호출합니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-READ-FLEX-JSON-01 | 허용한 flex 탭에서 연차 읽기를 호출합니다. 합성 응답은 JSON 객체입니다. | 객체를 성공 값으로 반환합니다. | 예정 |
| TC-U-READ-FLEX-JSON-02 | flex가 아닌 탭에서 같은 요청을 호출합니다. | 네트워크 요청을 보내지 않습니다. `FLEX_READ_FAILED`를 반환합니다. | 예정 |
| TC-U-READ-FLEX-JSON-03 | 서버가 로그인 화면으로 이동하라고 응답합니다. | `FLEX_REAUTH_REQUIRED`를 반환합니다. 로그인 화면의 원본을 반환하지 않습니다. | 예정 |
| TC-U-READ-FLEX-JSON-04 | 응답 본문이 JSON 객체가 아닌 배열 또는 HTML입니다. | `FLEX_READ_FAILED`를 반환합니다. | 예정 |
| TC-U-READ-FLEX-JSON-05 | 응답 전에 `signal`을 중단합니다. | 요청을 중단하고 `FLEX_READ_FAILED`를 반환합니다. 늦은 응답은 성공 값으로 반환하지 않습니다. | 예정 |
