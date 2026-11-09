# flex_get_work_summary

[도구 목록](../README.md) · [근무 요약 정책](../../features/extension-work-summary.md) · [투두 16](https://github.com/freevue/flex-mcp/issues/16) · [예정 연차 투두](https://github.com/freevue/flex-mcp/issues/18)

놀수는 회사가 지정한 쉬는 수요일입니다. 이 도구는 오늘 실제 근무, 이번 달 실제·인정 근무 누적, 연차와 놀수 반영 전후의 남은 시간을 읽습니다. 오늘 기준과 예정 연차를 반영한 예상치를 구분합니다. 원격 Node와 로컬 Worker는 현재 연결한 확장의 요약을 중계합니다. 원격 도구를 쓰려면 월 요약을 지원하는 Worker와 확장 버전이 필요합니다. [배포 설계](../cloudflare-workers.md)에서 경계를 확인합니다.

| 인자            | 타입     | 필수          | 설명                                                             |
| --------------- | -------- | ------------- | ---------------------------------------------------------------- |
| `connectionKey` | `string` | 원격에서 필수 | 승인에서 받은 키입니다. 본인 PC MCP는 빈 객체 `{}`로 호출합니다. |

두 방식 모두 한국 시간의 이번 달을 사용합니다. 계정, 기간과 놀수 날짜는 인자로 받지 않습니다.

| 결과                                                                     | 타입                                               | 설명                                                                                            |
| ------------------------------------------------------------------------ | -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `month`                                                                  | `string`                                           | 본인 PC MCP에서만 제공합니다. 한국 시간의 `YYYY-MM`입니다.                                      |
| `nolsuDates`                                                             | `string[] \| null`                                 | 본인 PC MCP에서만 제공합니다. 월 설정이 없으면 `null`입니다.                                    |
| `nolsuTargetMinutes`                                                     | `number \| null`                                   | 본인 PC MCP에서만 제공합니다. 월 목표에 포함된 놀수 시간의 합입니다.                            |
| `todayActualMinutes`                                                     | `number \| null`                                   | 팝업과 같은 오늘 실제 근무입니다. 진행 시간을 확인할 수 없으면 `null`입니다.                    |
| `monthActualMinutes`                                                     | `number`                                           | 이번 달 1일부터 오늘까지 Flex가 집계한 실제 근무입니다.                                         |
| `monthRecognizedMinutes`                                                 | `number`                                           | Flex 확정 인정 시간입니다. 원격에서는 확인한 오늘 진행 근무를 더합니다.                         |
| `monthRecognizedWithoutAnnualLeaveMinutes`                               | `number \| null`                                   | 인정 누적에서 연차 인정분만 뺀 시간입니다.                                                      |
| `monthAnnualLeaveUsedMinutes`                                            | `number \| null`                                   | 이번 달 1일부터 오늘까지 사용한 연차입니다.                                                     |
| `monthAnnualLeaveRecognizedMinutes`                                      | `number \| null`                                   | 사용 연차 중 인정 합계에 포함된 시간입니다.                                                     |
| `monthAnnualLeaveScheduledMinutes`                                       | `number \| null`                                   | 월 전체 Flex 집계에 포함된 내일부터 말일까지의 예정 연차입니다.                                 |
| `monthAnnualLeaveScheduledRecognizedMinutes`                             | `number \| null`                                   | 예정 연차 중 Flex가 근무로 인정할 시간입니다.                                                   |
| `standardRemainingMinutes`, `adjustedRemainingMinutes`                   | `number \| null`                                   | 오늘 기준 놀수 반영 전과 후의 남은 시간입니다. 계산에 필요한 정보가 없으면 `null`입니다.        |
| `projectedStandardRemainingMinutes`, `projectedAdjustedRemainingMinutes` | `number \| null`                                   | 해당 오늘 기준 값에서 예정 연차 인정 시간을 뺀 예상치입니다. 필요한 정보가 없으면 `null`입니다. |
| `adjustmentStatus`                                                       | `"not_configured" \| "unverified" \| "calculated"` | 본인 PC MCP에서만 제공합니다. 월 설정, 차감 근거와 계산 상태를 구분합니다.                      |

합성 확장의 원격 결과에는 `synthetic: true`가 붙습니다. 원격 호출은 기존 등록과 소켓을 확인한 뒤 브라우저에 요약만 요청합니다. 요청 한도는 20초입니다. 조회 원본과 로그인 정보는 전송하지 않습니다.

원격 요약의 남은 시간은 팝업과 같이 현재 진행 근무를 반영합니다. 진행 기록을 확인할 수 없으면 월 값은 확정 집계를 사용합니다. 남은 근무일수와 하루 권장 시간은 팝업에만 표시합니다.

## 화면 표시용 Markdown

원격 호출이 성공하면 `structuredContent`와 첫 번째 JSON 텍스트 뒤에 표시용 텍스트를 추가합니다. JSON과 기존 첫 텍스트의 값은 바뀌지 않습니다. 표시용 텍스트는 오늘 실제 근무, 이번 달 인정 근무, 이번 달 남은 시간을 차례로 보여 줍니다.

Markdown에는 고정 문구와 검증한 시간만 넣습니다. 합성 결과에는 예시 근무 데이터라고 표시합니다. 실패 응답과 다른 도구에는 Markdown을 붙이지 않습니다. [MCP 표시 명세](../../../wiki/feature/mcp-work-summary-display.md)에서 계산과 TC를 확인합니다.

로컬의 `getNolsuSummary(now?)`가 오늘, 월 누적, 월 전체를 읽습니다. `readNolsuTarget(readWork, range, dates, monthTarget)`은 날짜 구간을 합해 월 전체 목표와 대조합니다. [calculateWorkSummary](../../utilities/calculate-work-summary.md)는 두 남은 시간에 같은 인정 누적을 뺍니다. 확인한 날짜만 차감하고, 이미 빠진 날짜의 목표가 0이면 다시 빼지 않습니다. 두 값은 0분 아래로 내려가지 않습니다. 모든 시간의 단위는 분입니다. 연차를 분류할 수 없는 값은 `null`로 반환합니다. 오늘 기준 값에는 예정 연차를 넣지 않습니다. 예상치에는 예정 연차 인정 시간만 반영합니다.

| TC                | 입력과 조건                                                     | 기대 결과                                                 | 확인 범위                                                                  |
| ----------------- | --------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------- |
| TC-MCP-SUMMARY-01 | 합성 월 목표 160시간, 인정 누적 90시간, 놀수 차감 16시간입니다. | 미반영 70시간, 반영 54시간입니다.                         | [공통 계산 검사](../../../apps/chrome-extension/test/work-summary.test.ts) |
| TC-MCP-SUMMARY-02 | 월 목표에 포함된 놀수 두 날짜를 등록합니다.                     | 두 날짜의 목표만 빼고 다른 같은 요일은 유지합니다.        | 본인 PC의 실제 MCP 호출 확인                                               |
| TC-MCP-SUMMARY-03 | 월 설정이 없거나 월 목표와 구간 합이 일치하지 않습니다.         | 확인할 수 없는 반영 값은 `null`입니다.                    | 함수 계약. Workers 검증 예정                                               |
| TC-MCP-SUMMARY-04 | 소정 근무 목표가 0인 놀수를 적용합니다.                         | 해당 날짜에서 추가로 차감하지 않습니다.                   | [공통 계산 검사](../../../apps/chrome-extension/test/work-summary.test.ts) |
| TC-MCP-SUMMARY-05 | 예정 연차 4시간 중 3시간을 인정합니다.                          | 두 오늘 기준 값은 같습니다. 두 예상치만 3시간 줄어듭니다. | [공통 계산 검사](../../../apps/chrome-extension/test/work-summary.test.ts) |
| TC-MCP-SUMMARY-06 | 예정 연차 인정분을 확인하지 못합니다.                           | 두 예상치가 `null`입니다. 오늘 기준은 유지합니다.         | [공통 계산 검사](../../../apps/chrome-extension/test/work-summary.test.ts) |
