# calculateWorkSummary

[유틸 목록](../../UTILITIES.md)

월 근무 목표에서 인정 근무와 놀수 차감분을 뺍니다. 인정 합계에서 사용 연차의 인정분을 분리합니다. 예정 연차 인정 시간은 오늘 기준 값에서 빼서 예상치로 반환합니다.

구현 위치: `apps/chrome-extension/src/flex/workSummary.ts`

```typescript
declare function calculateWorkSummary(input: WorkSummaryInput): PopupWorkSummary;
```

| 매개변수 | 설명 |
| --- | --- |
| `input` | 오늘 실제 근무, 월 실제·인정 근무, 월 목표, 놀수 차감분, 사용·인정·예정 연차, 예정 연차 인정 시간 |

| TC | 조건 | 기대 결과 |
| --- | --- | --- |
| TC-U-WORK-SUMMARY-01 | 놀수 차감분이 없습니다. | 놀수 반영 값만 `null`입니다. |
| TC-U-WORK-SUMMARY-02 | 사용 연차 일부만 인정합니다. | 인정 합계에서 인정된 연차만 분리합니다. 남은 시간은 연차를 두 번 세지 않습니다. |
| TC-U-WORK-SUMMARY-03 | 예정 연차 일부만 인정합니다. | 인정 시간만 예상치에서 뺍니다. 오늘 기준은 그대로입니다. |
| TC-U-WORK-SUMMARY-04 | 예정 연차의 인정 시간이 확인되지 않습니다. | 예상치만 `null`입니다. |

[자동 검사](../../apps/chrome-extension/test/work-summary.test.ts)에서 확인합니다.
