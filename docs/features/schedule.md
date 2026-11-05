# 내 일정 조회

[투두 5](https://github.com/freevue/flex-mcp/issues/5) · [서비스 정책](../../SERVICE_POLICY.md) · [실조회 방식](reading-boundary.md)

`flex_get_schedule`은 연결한 계정의 기본 캘린더만 읽습니다. 날짜를 생략하면 한국 시간의 오늘부터 7일을 조회합니다. 날짜를 지정하면 `from`과 `to`를 함께 받습니다. 시작일과 종료일을 포함해 최대 31일을 조회합니다.

## 결과와 확인

결과는 `from`, `to`, `timezone`, `events`를 담습니다. 각 일정은 `title`, `type`, `status`, `allDay`, `startAt`, `endAtExclusive`를 담습니다. `endAtExclusive`는 포함하지 않는 종료 시점입니다. 종일 일정은 날짜만 반환합니다. 시간이 있는 일정은 시간대 정보가 있는 시각을 반환합니다.

서버는 [한국 날짜](../utilities/seoul-date.md)와 [기간 검사](../utilities/resolve-range.md)를 사용합니다. 확장은 [날짜 이동](../utilities/shift-date.md)으로 조회용 종료일을 다음 날로 바꿉니다. [일정 조회](../utilities/read-schedule.md)는 조회 기간과 겹치는 일정을 시작 순으로 반환합니다. 반복 항목을 포함합니다. 같은 일정의 같은 시작 항목은 한 번만 반환합니다.

일정이 없으면 `events`를 빈 배열로 반환합니다. 조회가 실패하거나 일부만 확인하면 빈 결과로 바꾸지 않습니다. 합성 데이터로 종일, 시간 지정, 반복, 중복, 종료일 경계를 확인합니다. 승인된 실제 계정에 반복 일정 표본이 없으면 그 검증을 미완료로 기록합니다.

## 테스트 케이스

연결한 테스트는 로컬에서 확인했습니다. Chrome이나 원격 환경이 필요한 항목은 예정입니다.

| TC | 확인 범위 | 준비와 실행 | 기대 결과 |
| --- | --- | --- | --- |
| TC-F-SCHEDULE-01 | 합성 연결 · [로컬 테스트](../../apps/mcp-server/test/query-integration.test.ts) | 한국 날짜를 `2027-01-01`로 고정하고 기간 없이 일정 도구를 호출합니다. | `2027-01-01`부터 `2027-01-07`까지의 본인 일정만 반환합니다. |
| TC-F-SCHEDULE-02 | 합성 연결 · [로컬 테스트](../../apps/mcp-server/test/query-integration.test.ts) | 당일, 포함 기준 31일, 32일을 각각 요청합니다. | 당일과 31일은 조회합니다. 32일은 Chrome에 보내기 전에 거부합니다. |
| TC-F-SCHEDULE-03 | 합성 연결 · [로컬 테스트](../../apps/chrome-extension/test/flex.test.ts) | 겹치는 종일 일정, 시간 지정 일정, 같은 시작 시점의 중복 반복 일정을 보냅니다. | 기간과 겹치는 일정만 시작 순으로 반환합니다. 중복 시작은 한 건입니다. 종료 시점은 포함하지 않습니다. |
| TC-F-SCHEDULE-04 | 합성 연결 · [로컬 테스트](../../apps/chrome-extension/test/flex.test.ts) | 정상적으로 빈 캘린더와 일부 일정만 읽은 경우를 각각 확인합니다. | 빈 캘린더는 `events: []`입니다. 일부만 읽으면 조회 실패입니다. |
| TC-F-SCHEDULE-05 | Chrome | 승인된 계정의 기본 캘린더에서 같은 기간의 종일, 시간 지정, 반복 일정을 대조합니다. | 조회 가능한 항목이 화면과 일치합니다. 실제 반복 표본이 없으면 그 검증은 미완료로 기록합니다. |
