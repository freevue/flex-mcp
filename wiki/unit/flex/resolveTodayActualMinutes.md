---
name: resolveTodayActualMinutes
type: unit
module: flex
issues: [39]
code: [apps/chrome-extension/src/flex/resolveTodayActualMinutes.ts]
---

# resolveTodayActualMinutes

확정 집계에 오늘의 진행 근무 시간을 더합니다.

## 시그니처

<!-- prettier-ignore -->
```typescript
export function resolveTodayActualMinutes(recordedMinutes: number, date: string, sampledAtMs: number, before: ActiveWorkSnapshot | null, after: ActiveWorkSnapshot | null): number | null
```

| 매개변수        | 타입                         | 기본값 | 의미                                            |
| --------------- | ---------------------------- | ------ | ----------------------------------------------- |
| recordedMinutes | `number`                     | 없음   | Flex에서 확인한 오늘의 확정 실제 근무 분입니다. |
| date            | `string`                     | 없음   | 한국 시간으로 계산할 날짜입니다.                |
| sampledAtMs     | `number`                     | 없음   | 두 번째 기록 상태를 읽은 시각입니다.            |
| before          | `ActiveWorkSnapshot \| null` | 없음   | 확정 집계를 읽기 전의 진행 기록입니다.          |
| after           | `ActiveWorkSnapshot \| null` | 없음   | 확정 집계를 읽은 뒤의 진행 기록입니다.          |

| 반환             | 의미                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| `number \| null` | 오늘의 실제 근무 분입니다. 불확실하거나 잘못된 입력이면 `null`입니다. |

## 내부 로직

1. 확정 분이 음수가 아닌 안전한 정수인지 확인합니다. 날짜와 조회 시각이 한국 시간으로 같은 날인지 확인합니다. 확인에 실패하면 `null`을 반환합니다.
2. 두 상태가 같은 날짜와 같은 진행 기록을 가리키는지 확인합니다. 시작과 휴게의 시각이 같아야 합니다. 조회가 실패했거나 두 상태가 다르면 `null`을 반환합니다.
3. 두 상태 모두 진행 기록이 없으면 확정 분을 그대로 반환합니다.
4. 오늘 0시와 근무 시작 중 늦은 시각부터 조회 시각까지의 시간을 계산합니다. 잘못된 시각, 시작 순서가 틀린 휴게, 둘 이상의 열린 휴게는 거부합니다.
5. 오늘 계산 범위에서 조회 시각까지 겹치는 휴게 시간만 뺍니다. 아직 시작하지 않은 예정 휴게는 빼지 않습니다. 열린 휴게의 끝은 조회 시각입니다. 휴게 구간끼리 겹치면 같은 시간을 한 번만 뺍니다.
6. 남은 경과 시간을 분으로 내림하고 확정 분에 더합니다. 합계가 안전한 정수가 아니면 `null`을 반환합니다.

## 사용법

```typescript
const todayActualMinutes = resolveTodayActualMinutes(
  recordedMinutes,
  date,
  sampledAtMs,
  before,
  after,
);
```

## 사용처

| 기능                                                        | 의미                                             |
| ----------------------------------------------------------- | ------------------------------------------------ |
| [갈피 근무 대시보드](../../feature/galpi-work-dashboard.md) | 팝업과 원격 MCP에서 읽는 공통 요약을 계산합니다. |

## TC

| ID                              | 조건                                                                             | 기대 결과                                                            |
| ------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| UT-resolveTodayActualMinutes-01 | 확정 집계가 0분입니다. 진행 중인 같은 기록을 10분, 11분 시점에 읽습니다.         | 10분, 11분을 반환합니다.                                             |
| UT-resolveTodayActualMinutes-02 | 끝난 휴게와 진행 중인 휴게가 있습니다.                                           | 실제 근무만 계산합니다. 열린 휴게 중에는 늘지 않습니다.              |
| UT-resolveTodayActualMinutes-03 | 기록이 종료됐거나 집계를 읽는 사이에 종료됩니다.                                 | 종료가 확인된 집계는 그대로 반환합니다. 바뀌는 중이면 `null`입니다.  |
| UT-resolveTodayActualMinutes-04 | 두 상태 중 하나를 못 읽습니다. 또는 오늘 기록이 없는 두 정상 응답입니다.         | 실패는 `null`이며 정상 0분은 0입니다.                                |
| UT-resolveTodayActualMinutes-05 | 자정을 넘는 기록입니다. 또는 순서가 틀리거나 시작하지 않은 열린 휴게가 있습니다. | 한국 시간 오늘에 속하는 분만 반환합니다. 잘못된 입력은 `null`입니다. |
| UT-resolveTodayActualMinutes-06 | 예정 휴게의 전, 도중, 후에 조회합니다. 열린 휴게와 예정 휴게가 겹칠 수 있습니다. | 조회 시각까지 겹친 휴게만 한 번씩 뺍니다.                            |
