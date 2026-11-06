# calculateWorkSummary

[유틸 목록](../../UTILITIES.md)

월 근무 목표에서 인정 근무와 휴무 차감분을 빼고 두 값을 반환합니다.

구현 위치: `apps/chrome-extension/src/flex/workSummary.ts`

```typescript
declare function calculateWorkSummary(input: WorkSummaryInput): PopupWorkSummary;
```

| 매개변수 | 설명 |
| --- | --- |
| `input` | 오늘 실제 근무, 월 실제·인정 근무, 월 목표와 휴무 차감분 |

확인할 경우: 휴무 차감분을 모르면 반영 값만 비웁니다. 남은 시간은 0보다 작지 않습니다.
