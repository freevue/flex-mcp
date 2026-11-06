# isQuery

[서버 함수 목록](../mcp/functions.md) · [구현](../../shared/validation.ts)

연차, 일정과 근무 조회 메시지만 받습니다. 일정과 근무에는 올바른 기간이 필요합니다.

```typescript
declare function isQuery(value: unknown): value is FlexQuery;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `unknown` | 중계하기 전 조회 요청입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-IS-QUERY-01 | 조회 요청에 사번이나 URL을 추가합니다. | 거부하고 브라우저로 보내지 않습니다. | 직접 자동 검사 예정 |
