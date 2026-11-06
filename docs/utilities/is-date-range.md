# isDateRange

[서버 함수 목록](../mcp/functions.md) · [구현](../../shared/validation.ts)

from과 to만 받습니다. 두 날짜를 포함해 31일 이하이며 순서가 맞는지 확인합니다.

```typescript
declare function isDateRange(value: unknown): value is DateRange;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `unknown` | 확인할 기간 객체입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-IS-DATE-RANGE-01 | 같은 날, 31일, 32일과 역순을 확인합니다. | 같은 날과 31일만 통과합니다. | 직접 자동 검사 예정 |
