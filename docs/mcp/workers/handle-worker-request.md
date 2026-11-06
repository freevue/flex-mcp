# handleWorkerRequest

[예정 함수 목록](README.md) · [배포 설계](../cloudflare-workers.md)

상태: 구현 예정. Worker의 fetch 진입점에서 호출합니다. 경로, 인증과 출처를 확인합니다. MCP는 createMcpHandler에, 등록과 소켓은 바인딩된 객체에 전달합니다.

```typescript
declare function handleWorkerRequest(request: Request, env: WorkerEnv, executionCtx: ExecutionContext): Promise<Response>;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `request` | `Request` | 외부 HTTPS 요청입니다. |
| `env` | `WorkerEnv` | 환경별 바인딩과 공개 설정입니다. |
| `executionCtx` | `ExecutionContext` | 현재 Workers 요청의 실행 문맥입니다. |

| TC | 입력과 조건 | 기대 결과 |
| --- | --- | --- |
| TC-W-HANDLE-WORKER-REQUEST-01 | 인증 없는 /mcp 요청을 보냅니다. | 401 인증 응답을 보냅니다. 도구를 실행하지 않습니다. |
| TC-W-HANDLE-WORKER-REQUEST-02 | 다른 출처로 /bridge/pair/start를 요청합니다. | 등록을 생성하지 않습니다. |
