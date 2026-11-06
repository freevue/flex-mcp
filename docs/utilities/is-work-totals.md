# isWorkTotals

[서버 함수 목록](../mcp/functions.md) · [구현](../../shared/validation.ts)

근무 집계 다섯 값이 유한한 숫자인지 확인합니다. 이 함수는 초과 필드를 검사하지 않습니다.

```typescript
declare function isWorkTotals(value: Record<string, unknown>): value is WorkTotals;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `Record<string, unknown>` | 분 단위 근무 집계를 담은 객체입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-IS-WORK-TOTALS-01 | 0분 집계와 집계 하나가 빠진 값을 비교합니다. | 0은 통과시키고 누락은 거부합니다. | 직접 자동 검사 예정 |
