# queryForCaller

[예정 함수 목록](README.md) · [배포 설계](../cloudflare-workers.md)

상태: 구현 예정. 객체 내부에서 현재 등록을 다시 확인합니다. 그 등록의 열린 소켓에만 요청을 보냅니다. 결과를 받기 전후에 권한과 소켓이 같아야 합니다.

```typescript
declare function queryForCaller(identity: WorkerCaller, query: FlexQuery): Promise<Outcome<FlexResult, WorkerFailure>>;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `identity` | `WorkerCaller` | Worker에서 확인한 신원과 읽기 권한입니다. |
| `query` | `FlexQuery` | 검사한 연차, 일정 또는 근무 요청입니다. |

| TC | 입력과 조건 | 기대 결과 |
| --- | --- | --- |
| TC-W-QUERY-FOR-CALLER-01 | 다른 소켓이 같은 요청 ID로 응답합니다. | 다른 소켓의 응답을 받지 않습니다. |
| TC-W-QUERY-FOR-CALLER-02 | 요청이 대기 중일 때 호출 권한을 회수합니다. | 결과를 버리고 접근 오류를 반환합니다. |
