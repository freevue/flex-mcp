# parseUrl

[서버 함수 목록](../mcp/functions.md) · [구현](../../shared/validation.ts)

문자열을 절대 URL로 읽습니다. 주소를 해석할 수 없으면 null입니다.

```typescript
declare function parseUrl(value: string): URL | null;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `string` | 해석할 주소입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-PARSE-URL-01 | 절대 URL과 경로만 있는 값을 보냅니다. | 절대 URL만 반환합니다. | 직접 자동 검사 예정 |
