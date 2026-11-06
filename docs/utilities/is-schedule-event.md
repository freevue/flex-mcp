# isScheduleEvent

[서버 함수 목록](../mcp/functions.md) · [구현](../../shared/validation.ts)

일정의 필드와 기간을 확인합니다. 종일 일정에는 날짜를 받습니다. 시간 일정에는 시간대가 있는 시각을 받습니다.

```typescript
declare function isScheduleEvent(value: unknown): value is ScheduleEvent;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `unknown` | 서버가 받을 일정 한 건입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-IS-SCHEDULE-EVENT-01 | 종일과 시간 일정의 정상 값, 종료가 시작보다 앞선 값을 보냅니다. | 앞선 종료를 거부합니다. | 직접 자동 검사 예정 |
