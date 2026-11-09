---
name: ActiveWorkSnapshot
type: type
module: flex
issues: [39]
code: [apps/chrome-extension/src/flex/resolveTodayActualMinutes.ts]
---

# ActiveWorkSnapshot

Flex 탭에서 확인한 오늘의 진행 기록입니다.

## 정의

```typescript
export type ActiveWorkSnapshot = {
  date: string;
  ongoing: {
    startMs: number;
    breaks: readonly { startMs: number; endMs: number | null }[];
  } | null;
};
```

## 필드

| 필드    | 타입                                                                                         | 의미                                                                                                                                                                                             |
| ------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| date    | `string`                                                                                     | 한국 시간의 날짜입니다.                                                                                                                                                                          |
| ongoing | `{ startMs: number; breaks: readonly { startMs: number; endMs: number \| null }[] } \| null` | 진행 중인 근무의 시작과 휴게입니다. `null`은 진행 기록이 없다는 뜻입니다. 시각은 밀리초입니다. 휴게는 시작 시각순입니다. 열린 휴게는 끝이 `null`입니다. 예정 휴게는 시작과 끝이 정해져 있습니다. |

## 사용처

| 위치                                                                      | 의미                                     |
| ------------------------------------------------------------------------- | ---------------------------------------- |
| [resolveTodayActualMinutes](../../unit/flex/resolveTodayActualMinutes.md) | 집계 앞뒤의 같은 진행 기록을 확인합니다. |
