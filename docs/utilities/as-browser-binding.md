# asBrowserBinding

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/registration/stateDatabase.ts)

조회 행에 문자열 ownerId와 bindingId가 있으면 등록 값을 만듭니다. 행이 없거나 타입이 다르면 null입니다.

```typescript
declare function asBrowserBinding(row: Record<string, unknown> | undefined): BrowserBinding | null;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `row` | `Record<string, unknown> \| undefined` | SQLite 조회 결과 한 행입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-AS-BROWSER-BINDING-01 | 등록 행이 없거나 필드 타입이 잘못됐습니다. | null을 반환합니다. | 직접 자동 검사 예정 |
