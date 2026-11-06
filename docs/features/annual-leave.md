# 내 연차 조회

[투두 3](https://github.com/freevue/flex-mcp/issues/3) · [서비스 정책](../../SERVICE_POLICY.md) · [실조회 방식](reading-boundary.md)

`flex_get_annual_leave`는 기간이나 사번을 받지 않습니다. 연결한 계정의 현재 연차만 읽습니다. 표준 입출력 서버는 미연결 오류를 반환합니다. 원격 합성 서버는 실제 잔액을 반환하지 않습니다. 승인된 연결에서만 실제 조회를 확인합니다.

| 결과 | 의미 |
| --- | --- |
| `asOf` | 잔액을 조회한 시각입니다. ISO 8601 형식으로 반환합니다. |
| `remaining` | 현재 남은 연차입니다. |
| `usable` | 현재 사용할 수 있는 연차입니다. |

각 잔액은 `days`, `totalMinutes`, `breakdown`을 담습니다. `breakdown`은 `days`, `hours`, `minutes`를 담습니다. flex가 반환한 단위를 유지합니다. 두 잔액이 같다고 가정하지 않습니다.

## 동작과 확인

확장은 [flex 탭을 찾고](../utilities/find-flex-tab.md) [현재 계정을 확인](../utilities/read-current-user.md)합니다. [조회 실행 함수](../utilities/run-flex-query.md)가 계정 일치를 확인하면 [연차를 읽습니다](../utilities/read-annual-leave.md). 조회에는 [flex 읽기 함수](../utilities/read-flex-json.md)를 사용합니다. [잔액 변환 함수](../utilities/parse-annual-leave.md)가 필요한 필드만 골라냅니다.

합성 데이터로 두 잔액이 다른 경우와 잔액이 0인 경우를 확인합니다. 명시적으로 기록이 없으면 `FLEX_NO_RECORDS`를 반환합니다. 잘못된 응답은 `FLEX_READ_FAILED`로 구분합니다. 승인된 Chrome에서 한 건을 조회한 뒤 flex 화면과 두 잔액을 대조합니다. 실제 잔액을 공개 이슈에 붙이지 않습니다.

## 테스트 케이스

연결한 테스트는 로컬에서 확인했습니다. Chrome이나 원격 환경이 필요한 항목은 예정입니다.

| TC | 확인 범위 | 준비와 실행 | 기대 결과 |
| --- | --- | --- | --- |
| TC-F-ANNUAL-LEAVE-01 | 합성 연결 · [로컬 테스트](../../apps/mcp-server/test/query-integration.test.ts) | 기간 없이 연차 도구를 호출합니다. 연결한 계정의 합성 응답은 잔여량과 사용 가능량이 다릅니다. | 연차 조회 하나만 실행합니다. 두 잔액을 분리하고 정한 필드만 반환합니다. |
| TC-F-ANNUAL-LEAVE-02 | 합성 연결 · [로컬 테스트](../../apps/chrome-extension/test/flex.test.ts) | 잔액 0, 명시한 기록 없음, 필수 값 누락을 각각 보냅니다. | 0은 성공입니다. 나머지는 `FLEX_NO_RECORDS`와 `FLEX_READ_FAILED`로 구분합니다. |
| TC-F-ANNUAL-LEAVE-03 | Chrome | 승인된 프로필의 flex 화면과 같은 계정에서 연차 도구를 한 번 호출합니다. | 잔여량과 사용 가능량이 화면과 각각 일치합니다. 실제 값은 공개 기록에 남기지 않습니다. |
| TC-F-ANNUAL-LEAVE-04 | Chrome | flex 탭을 닫은 상태와 다시 로그인해야 하는 상태에서 각각 조회합니다. | `FLEX_TAB_UNAVAILABLE`과 `FLEX_REAUTH_REQUIRED`를 구분합니다. |
