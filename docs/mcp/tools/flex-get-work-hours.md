# flex_get_work_hours

[도구 목록](../README.md) · [근무 시간 기능](../../features/work-hours.md) · [별도 근무 요약](flex-get-work-summary.md)

연결한 본인 계정에서 Flex가 집계한 근무 시간을 읽습니다. 놀수 차감은 이 도구에서 계산하지 않습니다.

| 인자 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `from` | `string` | `to`를 주면 필수 | 한국 시간 시작일입니다. `YYYY-MM-DD`를 사용합니다. |
| `to` | `string` | `from`을 주면 필수 | 한국 시간 종료일입니다. 시작일 이후 또는 같은 날이어야 합니다. |

두 날짜를 생략하면 이번 달 1일부터 오늘까지 조회합니다. 시작일과 종료일을 포함해 최대 31일입니다.

| 결과 | 타입 | 설명 |
| --- | --- | --- |
| `from`, `to`, `timezone` | `string` | 조회 범위입니다. 시간대는 `Asia/Seoul`입니다. |
| `actualMinutes`, `recognizedMinutes`, `requiredAgreedMinutes` | `number` | 실제, 인정, 소정 근무 시간입니다. 단위는 분입니다. |
| `overtimeMinutes`, `timeOffMinutes` | `number` | 연장 근무와 휴가 시간입니다. 단위는 분입니다. |

[buildRange](../../utilities/build-range.md)와 [resolveRange](../../utilities/resolve-range.md)가 기간을 정합니다. [forwardFlexQuery](../../utilities/forward-flex-query.md)가 조회를 보냅니다. [readWorkHours](../../utilities/read-work-hours.md)가 집계를 읽습니다. [parseBridgeReply](../../utilities/parse-bridge-reply.md)와 [isWorkTotals](../../utilities/is-work-totals.md)가 다섯 필드를 확인합니다.

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-MCP-WORK-01 | 한국 시간으로 새달 1일에 `{}`를 보냅니다. | 그날부터 그날까지 조회합니다. | [합성 통합](../../../apps/mcp-server/test/query-integration.test.ts) |
| TC-MCP-WORK-02 | `from`만 보냅니다. | `시작일과 종료일을 함께 지정하세요.` 오류입니다. | [서버 입력](../../../apps/mcp-server/test/public-server.test.ts) |
| TC-MCP-WORK-03 | 0분과 집계 필드가 빠진 응답을 각각 보냅니다. | 0은 성공입니다. 빠진 값은 추정하지 않습니다. | [확장 검사](../../../apps/chrome-extension/test/flex.test.ts) |
| TC-MCP-WORK-04 | 실제 계정의 같은 기간을 화면과 대조합니다. | 다섯 집계가 분 단위로 일치합니다. | 실계정 PC의 필드 조회만 확인. 화면 대조는 예정 |
