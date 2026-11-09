---
name: countRemainingWorkdays
type: unit
module: flex
issues: [41]
code: [apps/chrome-extension/src/flex/countRemainingWorkdays.ts]
---

# countRemainingWorkdays

Flex의 소정 근무일에서 놀수를 뺍니다.

## 시그니처

<!-- prettier-ignore -->
```typescript
export function countRemainingWorkdays(range: DateRange, dailyTargets: ReadonlyMap<string, number>, nolsuDates: readonly string[]): number | null
```

| 매개변수     | 타입                          | 기본값 | 의미                                                      |
| ------------ | ----------------------------- | ------ | --------------------------------------------------------- |
| range        | `DateRange`                   | 없음   | 한국 시간의 시작일과 마지막 날입니다. 두 날을 포함합니다. |
| dailyTargets | `ReadonlyMap<string, number>` | 없음   | 날짜별 소정 근무 분입니다.                                |
| nolsuDates   | `readonly string[]`           | 없음   | 근무일수에서 뺄 놀수 날짜입니다.                          |

| 반환             | 의미                                                                           |
| ---------------- | ------------------------------------------------------------------------------ |
| `number \| null` | 놀수를 뺀 근무일수입니다. 날짜나 소정 근무 분을 확인할 수 없으면 `null`입니다. |

## 내부 로직

1. 날짜 범위가 유효하고 최대 31일인지 확인합니다. 범위가 잘못되면 `null`을 반환합니다.
2. 시작일부터 마지막 날까지 하루씩 조회합니다. 날짜가 없거나 근무 분이 음수가 아닌 안전한 정수가 아니면 `null`을 반환합니다.
3. 소정 근무 분이 0보다 크고 놀수에 없는 날짜만 셉니다. 마지막 날을 센 뒤 일수를 반환합니다.

## 사용법

```typescript
const days = countRemainingWorkdays(
  { from: today, to: monthEnd },
  dailyTargets,
  nolsuDates,
);
```

## 사용처

| 기능                                                        | 의미                                                 |
| ----------------------------------------------------------- | ---------------------------------------------------- |
| [갈피 근무 대시보드](../../feature/galpi-work-dashboard.md) | 남은 근무일 표시와 하루 권장 시간 계산에 사용합니다. |

## TC

| ID                           | 조건                                                                               | 기대 결과             |
| ---------------------------- | ---------------------------------------------------------------------------------- | --------------------- |
| UT-countRemainingWorkdays-01 | 오늘과 말일에 소정 시간이 있습니다. 중간에 놀수와 소정 시간이 0분인 날이 있습니다. | 오늘과 말일만 셉니다. |
| UT-countRemainingWorkdays-02 | 기간 안의 하루가 빠졌습니다.                                                       | `null`을 반환합니다.  |
