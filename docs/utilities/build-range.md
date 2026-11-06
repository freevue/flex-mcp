# buildRange

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/createMcpServer.ts)

서버 내부 함수입니다. 한국 날짜를 기준으로 일정과 근무의 기본 범위를 다르게 정합니다. 지정한 범위는 resolveRange로 검사합니다.

```typescript
declare function buildRange(kind: "schedule" | "work", input: Partial<DateRange>): FlexQuery;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `kind` | `"schedule" \| "work"` | 일정 또는 근무 조회입니다. |
| `input` | `Partial<DateRange>` | 호출자가 보낸 시작일과 종료일입니다. 두 값은 함께 생략할 수 있습니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-BUILD-RANGE-01 | 새달 첫날에 두 도구를 인자 없이 호출합니다. | 일정은 7일, 근무는 당일 범위를 반환합니다. | [연결한 검사](../../apps/mcp-server/test/query-integration.test.ts) |
