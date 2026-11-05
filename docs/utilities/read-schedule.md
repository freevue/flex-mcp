# readSchedule

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/schedule.md) · [공통 타입](../UTILITY_TYPES.md)

연결한 계정의 기본 캘린더를 읽습니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/chrome-extension/src/flex/readSchedule.ts` |
| 상태 | 구현 예정 |
| 출력 | `from`, `to`, `timezone`, `events`입니다. 같은 일정의 같은 시작 항목은 한 번만 반환합니다. 일정의 종료 시점은 `endAtExclusive`로 반환합니다. |
| 실패 | 일정이 없으면 빈 배열을 반환합니다. 조회 실패나 일부 응답은 빈 배열로 바꾸지 않습니다. |

## 함수 계약

```typescript
declare function readSchedule(context: FlexPageContext, user: BrowserUser, range: DateRange, signal: AbortSignal): Promise<Outcome<ScheduleResult, FlexRequestFailure>>;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `context` | `FlexPageContext` | 필수 | 일정을 읽을 flex 탭의 문맥입니다. |
| `user` | `BrowserUser` | 필수 | 기본 캘린더를 읽을 현재 계정입니다. |
| `range` | `DateRange` | 필수 | 검사한 시작일과 종료일입니다. 두 날짜를 포함합니다. |
| `signal` | `AbortSignal` | 필수 | 일정 조회를 중단할 때 쓰는 신호입니다. |

## 테스트 케이스

아래 조건에서 `readSchedule`을 호출합니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-READ-SCHEDULE-01 | 기본 캘린더의 합성 응답에 기간과 겹치는 종일 일정과 시간 지정 일정이 있습니다. | 두 일정을 시작 순으로 반환합니다. `endAtExclusive`의 날짜와 시각 형식을 유지합니다. | 예정 |
| TC-U-READ-SCHEDULE-02 | 같은 반복 일정의 같은 시작 시점이 두 번 있고, 다른 날에도 반복됩니다. | 같은 시작 시점은 한 건만 남깁니다. 다른 날의 반복 항목은 남깁니다. | 예정 |
| TC-U-READ-SCHEDULE-03 | 조회 범위가 `2027-01-01` 하루입니다. 당일 자정에 끝나는 일정, 정오 일정, 다음 날 자정에 시작하는 일정이 있습니다. | 정오 일정만 반환합니다. 조회 시작에 끝난 일정과 조회 끝에 시작한 일정은 제외합니다. | 예정 |
| TC-U-READ-SCHEDULE-04 | 기본 캘린더가 정상적으로 비어 있습니다. | `events: []`를 반환합니다. | 예정 |
| TC-U-READ-SCHEDULE-05 | 일반 일정은 읽었지만 반복 일정 읽기에 실패합니다. | `FLEX_READ_FAILED`를 반환합니다. 일부 목록이나 빈 배열을 성공으로 반환하지 않습니다. | 예정 |
| TC-U-READ-SCHEDULE-06 | 응답에서 현재 사용자의 기본 캘린더에 속하지 않는 항목을 받습니다. | `FLEX_READ_FAILED`를 반환합니다. 다른 캘린더의 일정은 반환하지 않습니다. | 예정 |
