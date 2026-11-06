# getWorkSummaryRanges

[유틸 목록](../../UTILITIES.md) · [근무 요약](../features/extension-work-summary.md)

기준 시각을 한국 날짜로 바꿉니다. 오늘, 월 1일부터 오늘, 이번 달 전체를 반환합니다. 각 기간은 시작일과 종료일을 포함합니다.

```typescript
declare function getWorkSummaryRanges(now: Date): {
  today: DateRange;
  monthToDate: DateRange;
  fullMonth: DateRange;
};
```

`now`는 계산할 시각입니다.

| TC | 조건 | 기대 결과 |
| --- | --- | --- |
| TC-U-WORK-RANGES-01 | UTC 1월 31일 15시에 계산합니다. | 한국 날짜 2월 1일을 사용합니다. 윤년이면 전체 월 범위는 2월 29일에 끝납니다. |

[자동 검사](../../apps/chrome-extension/test/work-summary.test.ts)에서 확인합니다.
