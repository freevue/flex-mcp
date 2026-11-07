---
name: galpi-work-dashboard
type: feature
issues: [22]
code:
  [
    apps/chrome-extension/src/popup.ts,
    apps/chrome-extension/src/popup/components.ts,
    apps/chrome-extension/popup.html,
    apps/chrome-extension/popup.css,
    apps/mcp-server/src/createMcpServer.ts,
  ]
---

# 갈피 근무 대시보드

팝업에서 연결 상태와 근무 요약을 확인합니다. 세부 근무와 연차 정보는 승인한 에이전트에서 읽습니다.

## 구성 유닛

| 유닛                                                              | 역할                                                        |
| ----------------------------------------------------------------- | ----------------------------------------------------------- |
| [popupButton](../unit/popup/popupButton.md)                       | 다시 확인과 재연결에 쓰는 버튼을 만듭니다.                  |
| [renderApprovalCode](../unit/popup/renderApprovalCode.md)         | 최초 승인 대기에서 코드와 복사 버튼을 표시합니다.           |
| [renderUnavailablePopup](../unit/popup/renderUnavailablePopup.md) | MCP에 연결되지 않았거나 상태 확인에 실패한 화면을 만듭니다. |
| [renderConnectionRows](../unit/popup/renderConnectionRows.md)     | MCP와 Flex 상태를 두 항목으로 표시합니다.                   |
| [renderWorkSummary](../unit/popup/renderWorkSummary.md)           | 오늘 근무, 월 인정 근무, 남은 시간을 표시합니다.            |
| [formatWorkMinutes](../unit/popup/formatWorkMinutes.md)           | 분을 시간과 분으로 표시합니다.                              |

## 흐름

1. 팝업을 열면 확장 서비스 워커에서 상태를 읽습니다. MCP가 연결되기 전에는 코드 발급 또는 승인 대기 화면을 표시합니다. 상태 확인에 실패하면 다시 확인 버튼을 표시합니다.
2. MCP가 연결되면 MCP와 Flex를 두 상태로 표시합니다. Flex 미연결이면 근무 요약과 코드 확인을 숨깁니다. 등록한 계정의 Flex 탭을 열라는 안내와 다시 확인을 표시합니다.
3. Flex가 연결되거나 합성 모드이면 상태 아래에 근무 요약을 표시합니다. 합성 모드에서는 오늘 실제 근무 아래에 예시 근무 데이터 문구를 추가합니다.
4. 오늘 실제 근무 다음에 이번 달 인정 근무를 표시합니다. 그다음 이번 달 남은 시간을 표시합니다. 각 비교 값은 두 열로 두고, 남은 시간은 윗줄과 구분선만 사용합니다.
5. 상단의 코드 확인은 클릭 또는 Enter로 엽니다. 성공하면 코드를 복사하고 작은 창에 표시합니다. Escape로 닫으면 버튼에 포커스를 돌려줍니다.

시간은 분 단위이며, 날짜 경계는 한국 시간입니다. 월 누적의 기간은 이번 달 1일부터 오늘까지입니다. 월 목표의 기간은 이번 달 전체입니다.

| 화면              | 입력과 계산                                                                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 오늘 실제 근무    | `todayActualMinutes`를 표시합니다.                                                                                                                                      |
| 이번 달 인정 근무 | 연차 미포함은 `monthRecognizedMinutes`입니다. 연차 포함에는 `monthAnnualLeaveScheduledRecognizedMinutes`를 더합니다. 예정 인정분이 `null`이면 연차 포함도 `null`입니다. |
| 이번 달 남은 시간 | 놀수 미반영에는 `projectedStandardRemainingMinutes`를 표시합니다. 놀수 반영에는 `projectedAdjustedRemainingMinutes`를 표시합니다.                                       |

남은 시간의 기본값은 월 목표에서 현재 인정 누적을 뺀 값입니다. 놀수 적용 목표는 월 목표에서 확인한 놀수 차감 시간을 뺀 값입니다. 기본값과 놀수 반영값 각각에서 예정 연차 인정분을 빼면 예상치가 됩니다. 계산 결과는 0분보다 작아지지 않습니다. 필요한 입력이 없으면 해당 값은 `null`입니다.

상세 도구 `flex_get_work_summary`는 원격에서 `connectionKey: string`을 받습니다. 임의 계정, 기간과 놀수 날짜는 받지 않습니다. 승인한 채널이 연결돼 있으면 같은 Chrome 확장에 월 요약을 요청합니다. 존재하지 않거나 해제한 키는 `ACCESS_DENIED`로 거부합니다.

| 상세 응답                                                                        | 의미                                                                                                  |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `todayActualMinutes`, `monthActualMinutes`, `monthRecognizedMinutes`             | 오늘 실제 근무, 월 실제 누적과 월 인정 누적입니다.                                                    |
| `monthAnnualLeaveUsedMinutes`, `monthAnnualLeaveRecognizedMinutes`               | 사용한 연차와 그중 근무로 인정한 시간입니다.                                                          |
| `monthAnnualLeaveScheduledMinutes`, `monthAnnualLeaveScheduledRecognizedMinutes` | 내일부터 말일까지 예정된 연차와 그중 근무로 인정할 시간입니다.                                        |
| `monthRecognizedWithoutAnnualLeaveMinutes`                                       | 월 인정 누적에서 이미 인정한 사용 연차를 뺀 값입니다. 팝업의 연차 미포함은 이 값을 사용하지 않습니다. |
| `standardRemainingMinutes`, `adjustedRemainingMinutes`                           | 오늘 기준 놀수 전후 남은 시간입니다.                                                                  |
| `projectedStandardRemainingMinutes`, `projectedAdjustedRemainingMinutes`         | 예정 연차 인정분을 반영한 놀수 전후 남은 시간입니다.                                                  |
| `synthetic`                                                                      | 합성 결과에만 `true`를 넣습니다.                                                                      |

오늘·월 실제 근무와 월 인정 누적은 필수 숫자입니다. 나머지 시간 값은 계산에 필요한 정보가 없으면 `null`입니다. 추가 계산 기준은 [근무 요약 계산](../../docs/features/extension-work-summary.md)을 참고합니다.

## 관련 정책

| 정책                                                    | 규칙                      |
| ------------------------------------------------------- | ------------------------- |
| [갈피 근무 대시보드](../policy/galpi-work-dashboard.md) | POL-GALPI-DASHBOARD-01~06 |

## TC

| ID                    | 조건                                                                                            | 동작                                                                | 기대 결과                                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| FT-GALPI-DASHBOARD-01 | 월 목표 160시간, 월 인정 누적 90시간, 예정 인정 6시간, 놀수 차감 16시간인 합성 자료가 있습니다. | 팝업을 엽니다.                                                      | 오늘 근무가 먼저 보입니다. 월 인정은 96시간과 90시간입니다. 남은 시간은 64시간과 48시간입니다. 예시 근무 데이터라고 표시합니다. |
| FT-GALPI-DASHBOARD-02 | MCP는 연결되어 있고 Flex는 읽을 수 없습니다.                                                    | 팝업을 엽니다.                                                      | 상태와 다시 확인 버튼이 보입니다. 근무 요약과 코드 확인은 보이지 않습니다.                                                      |
| FT-GALPI-DASHBOARD-03 | Chromium에서 두 연결이 활성입니다.                                                              | Enter로 코드를 열고 Escape로 닫습니다. 루트 글자를 22px로 키웁니다. | 작은 창이 열리고 닫힙니다. 버튼에 포커스가 돌아갑니다. 근무 요약이 가로로 넘치지 않습니다.                                      |
| FT-GALPI-DASHBOARD-04 | 로컬 Node와 Worker에서 승인한 키, 미등록 키, 해제한 키를 준비합니다.                            | 상세 도구를 호출합니다.                                             | 승인한 키는 월 요약을 받습니다. 미등록·해제 키는 거부합니다.                                                                    |

01~03은 [Chromium 테스트](../../apps/mcp-server/test/browser.e2e.ts)에서 확인합니다. 04는 [Node 테스트](../../apps/mcp-server/test/shared-remote.test.ts)와 [Worker 테스트](../../apps/mcp-server/test/worker-smoke.test.ts)에서 같은 조회 계약을 확인합니다.
