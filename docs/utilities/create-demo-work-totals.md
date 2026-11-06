# createDemoWorkTotals

[유틸 목록](../../UTILITIES.md) · [근무 시간 조회](../features/work-hours.md)

지정한 날짜 범위의 합성 근무 집계를 만듭니다. Flex나 Chrome 프로필의 자료는 읽지 않습니다.

```typescript
declare function createDemoWorkTotals(range: DateRange, now?: Date): WorkTotals;
```

| 매개변수 | 설명 |
| --- | --- |
| `range` | 시작일과 종료일을 포함한 날짜 범위입니다. |
| `now` | 선택입니다. 한국의 오늘과 이번 달을 판단할 시각입니다. 기본값은 현재 시각입니다. |

| TC | 조건 | 기대 결과 |
| --- | --- | --- |
| TC-U-DEMO-TOTALS-01 | 오늘만 조회합니다. | 실제 근무와 인정 근무에 각각 320분을 반환합니다. |
| TC-U-DEMO-TOTALS-02 | 현재 월 전체를 조회합니다. | 기본 목표에 9,600분을 반환합니다. |

[근무 요약 테스트](../../apps/chrome-extension/test/work-summary.test.ts)에서 두 집계를 사용합니다.
