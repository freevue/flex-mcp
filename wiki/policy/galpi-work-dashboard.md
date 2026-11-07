---
name: galpi-work-dashboard
type: policy
issues: [22]
code: []
---

# 갈피 근무 대시보드 정책

팝업에는 현재 상태와 바로 읽을 수 있는 근무 요약을 표시합니다. 세부 집계는 MCP에서 제공합니다.

## 규칙

| ID                     | 규칙                                                                                                                                                    | 근거                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| POL-GALPI-DASHBOARD-01 | MCP와 Flex 상태를 따로 표시합니다. 두 연결이 활성일 때만 근무 요약을 표시합니다. 합성 자료에는 예시임을 표시합니다.                                     | [#22](https://github.com/freevue/flex-mcp/issues/22) |
| POL-GALPI-DASHBOARD-02 | 오늘 실제 근무를 먼저 표시합니다. 월 인정 근무의 두 값은 이미 인정한 사용 연차를 포함합니다. 연차 포함에만 예정 연차의 인정 시간을 더합니다.            | [#22](https://github.com/freevue/flex-mcp/issues/22) |
| POL-GALPI-DASHBOARD-03 | 남은 시간은 예정 연차를 반영한 놀수 전후의 두 값만 표시합니다. 놀수는 지정한 수요일 휴무입니다. 두 값에는 별도 카드 배경을 넣지 않습니다.               | [#22](https://github.com/freevue/flex-mcp/issues/22) |
| POL-GALPI-DASHBOARD-04 | 필요한 값이 없으면 계산 정보 없음으로 표시합니다. 정보가 없는 시간을 0분으로 계산하지 않습니다.                                                         | [#22](https://github.com/freevue/flex-mcp/issues/22) |
| POL-GALPI-DASHBOARD-05 | 월 실제 누적, 사용·예정 연차, 오늘 기준과 예상 남은 시간은 승인한 연결 키로 MCP에서 조회합니다. 연결 키와 실제 조회 결과는 검증 기록에 남기지 않습니다. | [#22](https://github.com/freevue/flex-mcp/issues/22) |
| POL-GALPI-DASHBOARD-06 | 두 연결이 활성일 때만 상단에 코드 확인을 표시합니다. 키보드로 열고 닫을 수 있게 합니다. 글자 크기를 높여도 근무 요약은 가로로 넘치지 않아야 합니다.     | [#22](https://github.com/freevue/flex-mcp/issues/22) |

## 적용 기능

| 기능                                                     | 적용 규칙                 |
| -------------------------------------------------------- | ------------------------- |
| [갈피 근무 대시보드](../feature/galpi-work-dashboard.md) | POL-GALPI-DASHBOARD-01~06 |
