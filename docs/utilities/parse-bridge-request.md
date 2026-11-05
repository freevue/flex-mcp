# parseBridgeRequest

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/remote-bridge.md) · [공통 타입](../UTILITY_TYPES.md)

확장이 받은 요청을 검사합니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/chrome-extension/src/bridge/parseBridgeRequest.ts` |
| 상태 | 구현 |
| 출력 | 요청 ID와 허용한 도구 종류입니다. 기간이 필요한 도구는 검사한 기간을 반환합니다. |
| 실패 | 정한 형태가 아니면 `INVALID_BRIDGE_MESSAGE`입니다. 추가 필드, 사번, 주소, 실행 코드를 거부합니다. |

## 함수 계약

```typescript
declare function parseBridgeRequest(value: unknown): Outcome<BridgeRequest, "INVALID_BRIDGE_MESSAGE">;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `value` | `unknown` | 필수 | 확장이 JSON으로 읽은 메시지입니다. 아직 형태가 확인되지 않은 값입니다. |

## 테스트 케이스

아래 조건에서 `parseBridgeRequest`을 호출합니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-PARSE-BRIDGE-REQUEST-01 | 요청 ID와 `kind: leave`만 있는 조회입니다. | 연차 요청을 반환합니다. | [로컬 테스트](../../apps/chrome-extension/test/bridge.test.ts) |
| TC-U-PARSE-BRIDGE-REQUEST-02 | 일정 요청이 `2027-01-01`부터 `2027-01-31`까지입니다. | 두 날짜를 포함하는 31일 요청을 반환합니다. | 예정 |
| TC-U-PARSE-BRIDGE-REQUEST-03 | 조회 기간이 32일이거나 날짜가 하나만 있습니다. | `INVALID_BRIDGE_MESSAGE`를 반환합니다. | 예정 |
| TC-U-PARSE-BRIDGE-REQUEST-04 | 연차에 기간을 넣거나 다른 사번, 임의 주소 또는 실행 코드 필드를 추가합니다. | `INVALID_BRIDGE_MESSAGE`를 반환합니다. 조회를 시작하지 않습니다. | [로컬 테스트](../../apps/chrome-extension/test/bridge.test.ts) |
| TC-U-PARSE-BRIDGE-REQUEST-05 | 요청 ID가 비어 있거나 `kind`가 허용 목록에 없습니다. | `INVALID_BRIDGE_MESSAGE`를 반환합니다. | 예정 |
