# handleRegistration

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/remote/registrationHttp.ts)

등록 시작과 수령, 기존 등록 코드, 접속권 발급, 등록 해제를 처리합니다. 호출 전에 상위 라우터가 확장 출처와 경로를 확인합니다.

```typescript
declare function handleRegistration(request: IncomingMessage, response: ServerResponse, database: DatabaseSync, relay: RelayContext): Promise<void>;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `request` | `IncomingMessage` | 허용 경로의 요청입니다. POST만 받습니다. |
| `response` | `ServerResponse` | 상태와 등록 결과를 보낼 응답입니다. |
| `database` | `DatabaseSync` | 등록과 권한 저장소입니다. |
| `relay` | `RelayContext` | 등록 해제 시 대기 요청과 소켓을 닫을 문맥입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-HANDLE-REGISTRATION-01 | 등록 수령을 승인 전과 후에 요청합니다. | 승인 전에는 pending, 승인 뒤 첫 요청은 registered입니다. | [연결한 검사](../../apps/mcp-server/test/shared-remote.test.ts) |
| TC-U-HANDLE-REGISTRATION-02 | 기존 확장 키로 등록을 해제합니다. | 204 뒤 같은 사용자 소켓 상태는 unregistered입니다. | [연결한 검사](../../apps/mcp-server/test/shared-remote.test.ts) |
