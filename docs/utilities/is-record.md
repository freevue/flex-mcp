# isRecord

[서버 함수 목록](../mcp/functions.md) · [구현](../../shared/validation.ts)

null과 배열을 제외한 객체인지 확인합니다. 필드 내용은 다른 함수에서 확인합니다.

```typescript
declare function isRecord(value: unknown): value is Record<string, unknown>;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `unknown` | 확인할 입력입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-IS-RECORD-01 | null, 배열, 객체를 각각 보냅니다. | 객체에만 true를 반환합니다. | 직접 자동 검사 예정 |
