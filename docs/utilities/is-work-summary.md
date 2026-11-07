# isWorkSummary

[상세 도구 계약](../mcp/tools/flex-get-work-summary.md) · [구현](../../shared/validation.ts)

`isWorkSummary(value: unknown): value is WorkSummaryResult`는 팝업과 중계에서 월 요약을 검사합니다. `value`는 아직 확인하지 않은 응답입니다. 필드 이름은 계약과 같아야 합니다. 분 단위 값은 음수가 아닌 안전한 정수입니다. 계약에서 허용한 필드만 `null`을 받습니다.

| TC                      | 입력                            | 기대 결과   |
| ----------------------- | ------------------------------- | ----------- |
| TC-U-IS-WORK-SUMMARY-01 | 계약에 맞는 월 요약             | 통과합니다. |
| TC-U-IS-WORK-SUMMARY-02 | 추가 계정 필드나 음수 근무 시간 | 거부합니다. |

[팝업 응답 검사](../../apps/chrome-extension/test/work-summary.test.ts)에서 확인합니다.
