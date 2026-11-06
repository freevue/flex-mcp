# 내 근무 시간 조회

[투두 5](https://github.com/freevue/flex-mcp/issues/5) · [서비스 정책](../../SERVICE_POLICY.md) · [실조회 방식](reading-boundary.md)

`flex_get_work_hours`는 연결한 계정의 근무 집계를 읽습니다. 날짜를 생략하면 한국 시간으로 이번 달 1일부터 오늘까지 조회합니다. 날짜를 지정하면 `from`과 `to`를 함께 받습니다. 두 날짜를 포함해 최대 31일을 조회합니다.

## 결과와 확인

결과에는 `from`, `to`, `timezone`과 아래 분 단위 집계를 담습니다. 화면의 집계와 같은 뜻을 유지합니다. 근무 시작과 종료 시각만으로 집계를 다시 계산하지 않습니다.

| 필드 | 뜻 |
| --- | --- |
| `actualMinutes` | 실제 근무 시간입니다. |
| `recognizedMinutes` | 인정 근무 시간입니다. |
| `requiredAgreedMinutes` | 소정 근무 시간입니다. |
| `overtimeMinutes` | 연장 근무 시간입니다. |
| `timeOffMinutes` | 휴가 시간입니다. |

서버는 [한국 날짜](../utilities/seoul-date.md)와 [기간 검사](../utilities/resolve-range.md)를 사용합니다. 확장은 [근무 시간 조회](../utilities/read-work-hours.md)로 승인된 집계를 읽습니다. 0분은 정상 수치입니다. 기록이 없다고 명시한 경우와 조회 실패는 [중계 오류 계약](remote-bridge.md)을 따릅니다.

합성 데이터로 월이 바뀌는 날과 0분을 확인합니다. 같은 기간의 실제 flex 화면과 다섯 집계를 대조합니다. 빠진 필드를 추정하지 않습니다. 공개 이슈에는 값 대신 일치 여부만 기록합니다.

[확장 팝업의 이번 달 근무 요약](extension-work-summary.md)은 화면에서 쓸 월 목표와 휴무 계산을 설명합니다. 도구의 기본 조회 범위는 그대로 유지합니다.

## 테스트 케이스

연결한 테스트는 로컬에서 확인했습니다. Chrome이나 원격 환경이 필요한 항목은 예정입니다. 기존 근무 시간 검사는 [공개 서버 테스트](../../apps/mcp-server/test/public-server.test.ts)에 있습니다.

| TC | 확인 범위 | 준비와 실행 | 기대 결과 |
| --- | --- | --- | --- |
| TC-F-WORK-HOURS-01 | 합성 연결 · [로컬 테스트](../../apps/mcp-server/test/query-integration.test.ts) | 한국 날짜가 새달 1일로 바뀌는 시각에 기간 없이 근무 시간 도구를 호출합니다. | 새달 1일부터 같은 날까지 조회합니다. |
| TC-F-WORK-HOURS-02 | 로컬 · 기존 테스트 | 공개 서버의 근무 시간 도구에 `from`만 넣습니다. | `시작일과 종료일을 함께 지정하세요.` 오류를 반환합니다. |
| TC-F-WORK-HOURS-03 | 합성 연결 · [로컬 테스트](../../apps/chrome-extension/test/flex.test.ts) | 0분이 있는 정상 집계, 기록 없음, 필수 집계 누락을 각각 보냅니다. | 0분은 정상 값입니다. 기록 없음과 조회 실패를 서로 다른 코드로 반환합니다. |
| TC-F-WORK-HOURS-04 | Chrome | 승인된 계정의 같은 기간에 대해 도구 결과와 flex 화면을 대조합니다. | 실제·인정·소정·연장근무와 휴가의 다섯 집계가 분 단위로 일치합니다. |
