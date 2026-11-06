# flex_get_annual_leave

[도구 목록](../README.md) · [연차 기능과 화면 검증](../../features/annual-leave.md)

연결한 본인 계정의 남은 연차와 사용할 수 있는 연차를 읽습니다. 두 값은 같을 필요가 없습니다.

| 인자 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `connectionKey` | `string` | 원격에서 필수 | 코드 승인 때 받은 해당 채널의 연결 키입니다. |

| 결과 | 타입 | 설명 |
| --- | --- | --- |
| `asOf` | `string` | 조회 시각입니다. ISO 8601 형식을 사용합니다. |
| `remaining`, `usable` | `LeaveBalance` | 두 값에 `days`, `totalMinutes`, `breakdown.days`, `breakdown.hours`, `breakdown.minutes`가 있습니다. 모두 숫자입니다. |

[서버 생성 함수](../../utilities/create-mcp-server.md)가 `{ kind: "leave" }`를 만듭니다. 원격 서버는 [호출 권한](../../utilities/authorize-mcp-caller.md)을 확인한 뒤 [중계](../../utilities/forward-flex-query.md)합니다. 확장의 [readAnnualLeave](../../utilities/read-annual-leave.md)와 [parseAnnualLeave](../../utilities/parse-annual-leave.md)가 두 잔액을 구분합니다. [parseBridgeReply](../../utilities/parse-bridge-reply.md)는 필수 필드만 받습니다. 본인 PC MCP는 브라우저에서 직접 읽은 뒤 같은 결과 계약을 사용합니다.

정상 잔액 0은 성공입니다. Flex가 기록 없음으로 답하면 `FLEX_NO_RECORDS`를 반환합니다. 결과를 읽을 수 없으면 잔액을 0으로 바꾸지 않습니다.

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-MCP-LEAVE-01 | `{}`를 보냅니다. 두 합성 잔액은 서로 다릅니다. | `remaining`과 `usable`을 따로 반환합니다. | [합성 통합](../../../apps/mcp-server/test/query-integration.test.ts) |
| TC-MCP-LEAVE-02 | `userId`를 추가합니다. | 입력 오류입니다. 조회하지 않습니다. | [서버 입력](../../../apps/mcp-server/test/public-server.test.ts) |
| TC-MCP-LEAVE-03 | 0일과 기록 없음의 응답을 각각 받습니다. | 정상 0과 오류를 구분합니다. | [확장 검사](../../../apps/chrome-extension/test/flex.test.ts) |
| TC-MCP-LEAVE-04 | 승인된 계정에서 두 잔액을 조회합니다. | Flex 화면과 두 값이 각각 일치합니다. | 설치한 Chrome과 Workers에서 확인 예정 |
