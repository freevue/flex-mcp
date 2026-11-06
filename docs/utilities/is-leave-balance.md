# isLeaveBalance

[서버 함수 목록](../mcp/functions.md) · [구현](../../shared/validation.ts)

잔액의 일수, 총 분과 일·시간·분 세부 값이 유한한 숫자인지 확인합니다. 정해진 필드만 받습니다.

```typescript
declare function isLeaveBalance(value: unknown): value is LeaveBalance;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `unknown` | 남은 연차 또는 사용 가능 연차의 잔액입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-IS-LEAVE-BALANCE-01 | 0분 잔액과 필드가 빠진 잔액을 보냅니다. | 정상 0을 통과시키고 빠진 값은 거부합니다. | 직접 자동 검사 예정 |
