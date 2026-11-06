# flex_get_work_summary

[도구 목록](../README.md) · [근무 요약 정책](../../features/extension-work-summary.md) · [투두 16](https://github.com/freevue/flex-mcp/issues/16)

놀수는 회사가 지정한 쉬는 수요일입니다. 이 도구는 오늘 실제 근무, 이번 달 실제 근무 누적과 놀수 반영 전후의 남은 시간을 읽습니다. 현재는 본인 PC MCP에만 있습니다. Workers의 호출 방식과 날짜 설정은 [배포 설계](../cloudflare-workers.md)를 따릅니다.

| 인자 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| 없음 | 빈 객체 `{}` | 해당 없음 | 한국 시간의 이번 달을 사용합니다. 호출자가 계정이나 휴무 날짜를 바꿀 수 없습니다. |

| 결과 | 타입 | 설명 |
| --- | --- | --- |
| `month` | `string` | 한국 시간의 `YYYY-MM`입니다. |
| `nolsuDates` | `string[] \| null` | 등록한 날짜입니다. 월 설정이 없으면 `null`입니다. |
| `nolsuTargetMinutes` | `number \| null` | 월 목표에 들어 있는 놀수 목표의 합입니다. 확인하지 못하면 `null`입니다. |
| `todayActualMinutes`, `monthActualMinutes` | `number` | 오늘 실제 근무와 이번 달 1일부터 오늘까지의 실제 근무입니다. |
| `standardRemainingMinutes`, `adjustedRemainingMinutes` | `number \| null` | 놀수 반영 전과 후의 남은 시간입니다. 단위는 분입니다. 계산에 필요한 정보가 없으면 `null`입니다. |
| `adjustmentStatus` | `"not_configured" \| "unverified" \| "calculated"` | 월 설정 없음, 차감 근거 미확인, 계산 완료를 구분합니다. |

로컬의 `getNolsuSummary(now?)`가 오늘, 월 누적, 월 전체를 읽습니다. `readNolsuTarget(range, nolsuDates, monthTarget)`은 날짜 구간을 합해 월 전체 목표와 대조합니다. [calculateWorkSummary](../../utilities/calculate-work-summary.md)는 두 남은 시간에 같은 인정 누적을 뺍니다. 확인한 날짜만 차감하고, 이미 빠진 날짜의 목표가 0이면 다시 빼지 않습니다. 두 값은 0분 아래로 내려가지 않습니다.

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-MCP-SUMMARY-01 | 합성 월 목표 160시간, 인정 누적 90시간, 놀수 차감 16시간입니다. | 미반영 70시간, 반영 54시간입니다. | [공통 계산 검사](../../../apps/chrome-extension/test/work-summary.test.ts) |
| TC-MCP-SUMMARY-02 | 월 목표에 포함된 놀수 두 날짜를 등록합니다. | 두 날짜의 목표만 빼고 다른 같은 요일은 유지합니다. | 본인 PC의 실제 MCP 호출 확인 |
| TC-MCP-SUMMARY-03 | 월 설정이 없거나 월 목표와 구간 합이 일치하지 않습니다. | 확인할 수 없는 반영 값은 `null`입니다. | 함수 계약. Workers 검증 예정 |
| TC-MCP-SUMMARY-04 | 소정 근무 목표가 0인 놀수를 적용합니다. | 해당 날짜에서 추가로 차감하지 않습니다. | [공통 계산 검사](../../../apps/chrome-extension/test/work-summary.test.ts) |
