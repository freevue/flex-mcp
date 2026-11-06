# handleWorkerRequest

[예정 함수 목록](README.md) · [배포 설계](../cloudflare-workers.md)

상태: 구현 예정. Worker의 fetch 진입점에서 호출합니다. 호스트와 경로를 확인합니다. 등록, 소켓과 MCP 요청을 바인딩된 객체에 전달합니다.

```typescript
declare function handleWorkerRequest(request: Request, environment: WorkerEnvironment, executionCtx: ExecutionContext): Promise<Response>;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `request` | `Request` | 외부 HTTPS 요청입니다. |
| `environment` | `WorkerEnvironment` | 환경별 바인딩과 공개 설정입니다. |
| `executionCtx` | `ExecutionContext` | 현재 Workers 요청의 실행 문맥입니다. |

| TC | 입력과 조건 | 기대 결과 |
| --- | --- | --- |
| TC-W-HANDLE-WORKER-REQUEST-01 | 키 없이 `/mcp` 초기화와 조회를 요청합니다. | 초기화는 성공합니다. 조회 결과는 반환하지 않습니다. |
| TC-W-HANDLE-WORKER-REQUEST-02 | 다른 출처로 /bridge/pair/start를 요청합니다. | 등록을 생성하지 않습니다. |
