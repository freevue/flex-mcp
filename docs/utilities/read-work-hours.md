# readWorkHours

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/work-hours.md) · [공통 타입](../UTILITY_TYPES.md)

확인한 계정의 근무 집계를 읽습니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/chrome-extension/src/flex/readWorkHours.ts` |
| 상태 | 구현 예정 |
| 출력 | [근무 집계](../features/work-hours.md)에 정한 다섯 값과 조회 기간입니다. 값은 분 단위입니다. |
| 실패 | 0분은 정상 수치입니다. 기록 없음은 `FLEX_NO_RECORDS`입니다. 필수 집계가 없거나 요청이 실패하면 `FLEX_READ_FAILED`입니다. |

## 함수 계약

```typescript
declare function readWorkHours(context: FlexPageContext, user: BrowserUser, range: DateRange, signal: AbortSignal): Promise<Outcome<WorkHoursResult, FlexReadFailure>>;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `context` | `FlexPageContext` | 필수 | 근무 집계를 읽을 flex 탭의 문맥입니다. |
| `user` | `BrowserUser` | 필수 | 집계를 읽을 현재 계정입니다. |
| `range` | `DateRange` | 필수 | 검사한 시작일과 종료일입니다. 두 날짜를 포함합니다. |
| `signal` | `AbortSignal` | 필수 | 근무 조회를 중단할 때 쓰는 신호입니다. |

## 테스트 케이스

아래 조건에서 `readWorkHours`을 호출합니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-READ-WORK-HOURS-01 | 합성 집계의 실제 근무는 60분, 인정 근무는 45분, 연장 근무는 0분입니다. | 다섯 집계와 기간을 반환합니다. 서로 다른 값과 0분을 그대로 유지합니다. | 예정 |
| TC-U-READ-WORK-HOURS-02 | 응답에 기록이 없다고 명시돼 있습니다. | `FLEX_NO_RECORDS`를 반환합니다. | 예정 |
| TC-U-READ-WORK-HOURS-03 | 시작과 종료 시각은 있지만 필수 집계가 없습니다. | `FLEX_READ_FAILED`를 반환합니다. 집계 값을 계산하거나 0으로 채우지 않습니다. | 예정 |
