# isRequestId

[서버 함수 목록](../mcp/functions.md) · [구현](../../shared/validation.ts)

요청 ID에 영문, 숫자, 밑줄과 하이픈만 1자부터 128자까지 있는지 확인합니다.

```typescript
declare function isRequestId(value: unknown): value is string;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `unknown` | 응답 또는 요청의 ID입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-IS-REQUEST-ID-01 | 공백이 있거나 129자인 ID를 확인합니다. | false를 반환합니다. | 직접 자동 검사 예정 |
