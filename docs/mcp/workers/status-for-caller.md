# statusForCaller

[예정 함수 목록](README.md) · [배포 설계](../cloudflare-workers.md)

상태: 구현 예정. 현재 등록과 소켓만 읽습니다. 등록과 소켓이 같은 사용자에 속해야 online입니다. Flex에는 요청을 보내지 않습니다.

```typescript
declare function statusForCaller(identity: WorkerCaller): Promise<Outcome<BrowserConnectionStatus, WorkerFailure>>;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `identity` | `WorkerCaller` | Worker에서 확인한 호출자입니다. |

| TC | 입력과 조건 | 기대 결과 |
| --- | --- | --- |
| TC-W-STATUS-FOR-CALLER-01 | 두 사용자 중 한 사람만 소켓을 닫습니다. | 해당 사용자만 offline입니다. |
| TC-W-STATUS-FOR-CALLER-02 | 사용자의 등록을 해제합니다. | 해당 사용자에게 unregistered를 반환합니다. |
