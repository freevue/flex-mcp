# requireOwnerId

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/registration/stateDatabase.ts)

운영 명령에 사용하는 사용자 ID 형식을 확인합니다. 영문, 숫자, 밑줄과 하이픈을 1자부터 80자까지 받습니다. 그 외에는 예외를 던집니다.

```typescript
declare function requireOwnerId(ownerId: string): void;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `ownerId` | `string` | 운영자가 지정한 사용자 ID입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-REQUIRE-OWNER-ID-01 | 빈 값, 공백이나 81자가 있는 ID를 보냅니다. | 입력 오류로 중단합니다. | 직접 자동 검사 예정 |
