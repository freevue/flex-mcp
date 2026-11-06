# flex_get_schedule

[도구 목록](../README.md) · [일정 기능](../../features/schedule.md)

연결한 본인 기본 캘린더에서 날짜 범위와 겹치는 일정을 읽습니다. 날짜는 한국 시간입니다.

| 인자 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `connectionKey` | `string` | 원격에서 필수 | 코드 승인 때 받은 해당 채널의 연결 키입니다. |
| `from` | `string` | `to`를 주면 필수 | 시작일입니다. `YYYY-MM-DD`를 사용합니다. |
| `to` | `string` | `from`을 주면 필수 | 종료일입니다. 시작일 이후 또는 같은 날이어야 합니다. |

두 날짜를 생략하면 오늘부터 7일을 조회합니다. 두 날짜를 포함해 최대 31일입니다. 계정, 캘린더 ID와 조회 URL은 받지 않습니다.

| 결과 | 타입 | 설명 |
| --- | --- | --- |
| `from`, `to`, `timezone` | `string` | 조회 범위입니다. 시간대는 `Asia/Seoul`입니다. |
| `events` | `ScheduleEvent[]` | 항목마다 `title`, `type`, `status`, `startAt`, `endAtExclusive` 문자열과 `allDay` 불리언이 있습니다. |

`endAtExclusive`는 일정에 포함되지 않는 종료 시점입니다. 종일 일정은 날짜로 표시합니다. 시간 일정은 시간대가 있는 시각으로 표시합니다.

[buildRange](../../utilities/build-range.md)가 [seoulDate](../../utilities/seoul-date.md), [shiftDate](../../utilities/shift-date.md)와 [resolveRange](../../utilities/resolve-range.md)로 범위를 정합니다. [forwardFlexQuery](../../utilities/forward-flex-query.md)가 조회를 보냅니다. [readSchedule](../../utilities/read-schedule.md)이 겹치는 일정과 중복 반복 항목을 처리합니다. [isScheduleEvent](../../utilities/is-schedule-event.md)가 서버에서 항목의 필드를 확인합니다.

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-MCP-SCHEDULE-01 | `{}`, 기준일은 합성 한국 날짜 `2027-01-01`입니다. | 1일부터 7일까지 반환합니다. | [합성 통합](../../../apps/mcp-server/test/query-integration.test.ts) |
| TC-MCP-SCHEDULE-02 | 같은 날, 31일, 32일과 날짜 하나만 보냅니다. | 같은 날과 31일은 허용합니다. 32일과 불완전한 입력은 거부합니다. | [기간 검사](../../../apps/mcp-server/test/dates.test.ts) 및 [도구 통합](../../../apps/mcp-server/test/query-integration.test.ts) |
| TC-MCP-SCHEDULE-03 | 빈 캘린더와 일부만 읽은 캘린더를 각각 보냅니다. | 빈 성공은 `events: []`입니다. 일부만 읽으면 오류입니다. | [확장 검사](../../../apps/chrome-extension/test/flex.test.ts) |
| TC-MCP-SCHEDULE-04 | 종일, 시간 지정, 반복 일정을 화면과 대조합니다. | 범위와 겹치는 본인 일정만 반환합니다. | 종일 표본은 PC 확인. 시간 지정과 반복 실계정 표본은 미확인 |
