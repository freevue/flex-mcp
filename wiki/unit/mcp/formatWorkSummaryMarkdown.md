---
name: formatWorkSummaryMarkdown
type: unit
module: mcp
issues: [22]
code: [apps/mcp-server/src/formatWorkSummaryMarkdown.ts]
---

# formatWorkSummaryMarkdown

근무 요약 응답의 숫자를 화면 표시용 Markdown으로 바꿉니다.

## 시그니처

<!-- prettier-ignore -->
```typescript
export function formatWorkSummaryMarkdown(result: Record<string, unknown>): string | undefined
```

| 매개변수 | 타입                      | 기본값 | 의미                                                                                  |
| -------- | ------------------------- | ------ | ------------------------------------------------------------------------------------- |
| result   | `Record<string, unknown>` | 없음   | 근무 요약의 기존 JSON 객체입니다. 합성 응답에는 `synthetic: true`가 있을 수 있습니다. |

| 반환                  | 의미                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| `string \| undefined` | 검증을 통과하면 Markdown을 반환합니다. 필수 값이 없거나 입력이 계약과 다르면 `undefined`를 반환합니다. |

## 내부 로직

1. 합성 표시를 떼어 별도로 확인합니다. 값은 `true`이거나 없어야 합니다. 그 외의 값이면 바로 반환합니다.
2. 나머지는 기존 근무 요약 검증으로 검사합니다. 시간은 0 이상의 안전한 정수입니다. 조회 계약에서 허용한 항목만 `null`일 수 있습니다. 알 수 없는 필드와 문자열 시간 값은 거부합니다.
3. 오늘 실제 근무에는 `todayActualMinutes`를 사용합니다. 월 인정 근무의 미포함 값에는 `monthRecognizedMinutes`를 사용합니다.
4. 연차 포함 값은 월 인정 근무와 `monthAnnualLeaveScheduledRecognizedMinutes`의 합입니다. 예정 인정분이 `null`이거나 합이 안전한 정수 범위를 넘으면 포함 값을 비웁니다.
5. 놀수 전후에는 `projectedStandardRemainingMinutes`와 `projectedAdjustedRemainingMinutes`를 그대로 사용합니다. 오늘 기준 남은 시간으로 대체하지 않습니다.
6. 60으로 나눈 몫은 시간입니다. 나머지가 있으면 분도 표시합니다. 0분은 `0시간`입니다. 비운 값은 `계산 정보 없음`입니다.
7. 아래 고정 서식에 값을 넣습니다. 합성이면 가장 앞에 `예시 근무 데이터`와 빈 줄을 붙입니다. 외부 자유 텍스트, 링크와 지시문은 넣지 않습니다.

```markdown
### 오늘 실제 근무

<오늘>

### 이번 달 인정 근무

- 연차 포함: <포함>
- 연차 미포함: <미포함>

### 이번 달 남은 시간

- 놀수 미반영: <예상 미반영>
- 놀수 반영: <예상 반영>
```

## 사용법

```typescript
const markdown = formatWorkSummaryMarkdown(result);
```

## 사용처

| 위치                                                            | 용도                                            |
| --------------------------------------------------------------- | ----------------------------------------------- |
| [MCP 근무 요약 표시](../../feature/mcp-work-summary-display.md) | 근무 요약 성공 응답에 덧붙일 텍스트를 만듭니다. |

## TC

| ID                              | 입력                                                                                     | 기대 결과                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| UT-formatWorkSummaryMarkdown-01 | 오늘 320분, 월 인정 5,400분, 예정 인정 360분, 예상 전후 3,840분과 2,880분입니다.         | 오늘 5시간 20분, 월 96시간과 90시간, 남은 64시간과 48시간을 이 순서로 표시합니다. |
| UT-formatWorkSummaryMarkdown-02 | 합성 결과에서 오늘과 월 인정은 0분입니다. 예정 인정과 놀수 반영 예상치는 `null`입니다.   | 예시를 표시합니다. 오늘·연차 미포함의 0분과 계산 정보 없음을 구분합니다.          |
| UT-formatWorkSummaryMarkdown-03 | 검증할 숫자 대신 외부 문자열을 넣거나, 알 수 없는 필드 또는 잘못된 합성 값을 추가합니다. | `undefined`를 반환합니다.                                                         |
| UT-formatWorkSummaryMarkdown-04 | 월 인정과 예정 인정의 합이 안전한 정수 범위를 넘습니다.                                  | 연차 포함에 계산 정보 없음을 표시합니다.                                          |
