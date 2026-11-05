# parseBridgeReply

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/remote-bridge.md) · [공통 타입](../UTILITY_TYPES.md)

서버가 받은 확장 응답을 도구 계약과 대조합니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/mcp-server/src/bridge/parseBridgeReply.ts` |
| 상태 | 구현 |
| 출력 | 요청 ID와 해당 도구의 결과 또는 허용한 오류 코드입니다. |
| 실패 | 결과와 오류가 함께 있거나, 필드나 기간이 다르면 `INVALID_BRIDGE_MESSAGE`입니다. 접근 정보가 담긴 추가 필드를 거부합니다. |

## 함수 계약

```typescript
declare function parseBridgeReply(value: unknown, expectedQuery: FlexQuery): Outcome<BridgeReply, "INVALID_BRIDGE_MESSAGE">;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `value` | `unknown` | 필수 | 서버가 확장 연결에서 받은 응답입니다. |
| `expectedQuery` | `FlexQuery` | 필수 | 대기 중인 원래 조회입니다. 종류와 기간의 비교에 사용합니다. |

## 테스트 케이스

아래 조건에서 `parseBridgeReply`을 호출합니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-PARSE-BRIDGE-REPLY-01 | 연차 요청에 요청 ID와 정한 연차 결과를 보냅니다. | 연차 결과를 성공으로 반환합니다. | [로컬 테스트](../../apps/mcp-server/test/relay.test.ts) |
| TC-U-PARSE-BRIDGE-REPLY-02 | 결과 없이 `FLEX_REAUTH_REQUIRED`를 보냅니다. | 허용된 실패 응답을 반환합니다. | [로컬 테스트](../../apps/mcp-server/test/relay.test.ts) |
| TC-U-PARSE-BRIDGE-REPLY-03 | 근무 시간 요청에 일정 결과를 보냅니다. | `INVALID_BRIDGE_MESSAGE`를 반환합니다. | 예정 |
| TC-U-PARSE-BRIDGE-REPLY-04 | 일정 결과의 기간이 원래 요청과 다릅니다. | `INVALID_BRIDGE_MESSAGE`를 반환합니다. | 예정 |
| TC-U-PARSE-BRIDGE-REPLY-05 | 결과와 오류를 함께 보내거나 알 수 없는 코드나 필드를 넣습니다. | `INVALID_BRIDGE_MESSAGE`를 반환합니다. | 예정 |
