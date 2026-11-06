# calculateRestTargetMinutes

[유틸 목록](../../UTILITIES.md) · [휴무 적용](../features/extension-work-summary.md)

월 범위에서 지정한 휴무 요일의 소정 근무 시간을 합합니다. 목표 자료가 날짜를 이미 휴무로 처리했으면 해당 날짜의 목표는 0입니다.

```typescript
declare function calculateRestTargetMinutes(
  range: DateRange,
  restWeekdays: readonly WorkWeekday[],
  dailyTargets: Readonly<Record<string, number | null>>,
): number | null;
```

| 매개변수 | 설명 |
| --- | --- |
| `range` | 한국 날짜의 시작일과 종료일입니다. 두 날짜를 포함합니다. 한 달 이내의 유효한 범위입니다. |
| `restWeekdays` | 휴무로 설정한 요일입니다. 0은 일요일, 6은 토요일입니다. |
| `dailyTargets` | 한국 날짜별 기본 목표 시간입니다. 단위는 분입니다. |

| TC | 조건 | 기대 결과 |
| --- | --- | --- |
| TC-U-REST-TARGET-01 | 수요일 목표가 각각 480분, 0분입니다. | 480분을 반환합니다. |
| TC-U-REST-TARGET-02 | 휴무 요일 하나의 날짜별 목표가 없거나 유효하지 않습니다. | `null`을 반환합니다. |
| TC-U-REST-TARGET-03 | 휴무 요일을 지정하지 않았습니다. | 0분을 반환합니다. |

[자동 검사](../../apps/chrome-extension/test/work-summary.test.ts)에서 확인합니다.
