---
name: WorkStatusResult
type: type
module: shared
issues: [26]
code: [shared/workStatus.ts]
---

# WorkStatusResult

본인의 현재 근무 기록 상태 하나를 나타냅니다.

## 정의

<!-- prettier-ignore -->
```typescript
export type WorkStatusResult = { status: "working" | "on_break" | "idle" | "unknown" };
```

## 필드

| 필드   | 타입                                             | 필수 | 의미                                                                                                             |
| ------ | ------------------------------------------------ | ---- | ---------------------------------------------------------------------------------------------------------------- |
| status | `"working" \| "on_break" \| "idle" \| "unknown"` | 예   | 근무 중, 휴게 중, 기록 중 아님, 확인 불가를 순서대로 뜻합니다. idle은 진행 중인 기록이 없음을 확인한 경우입니다. |

## 사용처

| 위치                                                          | 용도                                  |
| ------------------------------------------------------------- | ------------------------------------- |
| [isWorkStatusResult](../../unit/shared/isWorkStatusResult.md) | 서버와 확장의 입력을 검사합니다.      |
| [readLiveReply](../../unit/bridge/readLiveReply.md)           | 확장이 승인된 채널에 상태를 보냅니다. |
| [renderWorkSummary](../../unit/popup/renderWorkSummary.md)    | 현재 상태를 화면 문구로 표시합니다.   |
