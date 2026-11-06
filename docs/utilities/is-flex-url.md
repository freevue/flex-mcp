# isFlexUrl

[서버 함수 목록](../mcp/functions.md) · [구현](../../shared/validation.ts)

사용자 정보가 없는 https://flex.team 출처만 받습니다. 비슷한 이름의 다른 사이트는 거부합니다.

```typescript
declare function isFlexUrl(value: string): boolean;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `string` | 확장 탭에서 얻은 URL입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-IS-FLEX-URL-01 | 다른 사이트에서 Flex 조회를 요청합니다. | 조회 경로로 사용하지 않습니다. | [연결한 검사](../../apps/chrome-extension/test/bridge.test.ts) |
