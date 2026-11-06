# Workers 합성 검증 구현

[배포 절차](workers-release.md) · [운영 설계](cloudflare-workers.md) · [로컬 Workers 검사](../../apps/mcp-server/test/worker-smoke.test.ts)

이 구현은 Node와 같은 도구 다섯 개를 제공합니다. 브라우저 조회 결과는 합성 자료에 한합니다. OAuth, 실제 Flex 조회와 놀수 요약은 별도 작업입니다. Wrangler의 운영 모의 배포는 Worker 번들과 설정을 확인합니다.

| 함수 | 매개변수 | 역할 |
| --- | --- | --- |
| [initializeStateDatabase](../utilities/initialize-state-database.md) | `database: StateDatabase` | 같은 등록 테이블을 Node와 Durable Object에서 준비합니다. |
| [runStateTransaction](../utilities/run-state-transaction.md) | `database: StateDatabase`, `operation: () => Result` | 각 저장 환경에서 등록 변경을 한 번에 처리합니다. |
| [readWorkerConfiguration](../utilities/read-worker-configuration.md) | `environment: WorkerEnvironment` | 확장 ID와 에이전트 설정을 검사합니다. |
| [syncWorkerAgents](../utilities/sync-worker-agents.md) | `database: StateDatabase`, `agents: readonly AgentConfiguration[]` | 설정이 달라지면 저장소의 에이전트 권한을 바꿉니다. |
| [createWorkerDatabase](../utilities/create-worker-database.md) | `storage: DurableObjectStorage` | Durable Object의 SQL을 공통 계약에 연결합니다. |
| [createBrowserSockets](../utilities/create-browser-sockets.md) | `context: DurableObjectState`, `database: StateDatabase`, `relay: RelayContext` | 소켓을 열고 인증합니다. 절전 뒤 현재 등록을 확인합니다. |
| Worker `fetch` | `request: Request`, `environment: WorkerEnvironment` | 호스트와 경로를 확인하고 객체에 요청을 전달합니다. |
| `FlexBridge.fetch` | `request: Request` | 확장 출처와 에이전트 키를 확인합니다. |
| `handleMcp`, `handleRegistration` | `request: Request`; 등록 함수는 `path: string`도 받습니다. | MCP를 열거나 승인 요청과 등록을 처리합니다. |
| `webSocketMessage` | `socket: WebSocket`, `message: string \| ArrayBuffer` | 처음에는 접속권을 확인합니다. 이후에는 검증한 응답만 중계합니다. |
| `webSocketClose`, `webSocketError` | `socket: WebSocket`; 종료 함수는 `code: number`도 받습니다. | 해당 소켓과 대기 요청을 종료합니다. |

| TC | 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-W-IMPL-01 | 인증 없이 `/mcp`를 호출하거나 허용하지 않은 확장 출처에서 등록합니다. | 각각 401과 403을 반환합니다. | 로컬 Workers |
| TC-W-IMPL-02 | 조회 전용 키와 승인 키로 같은 코드를 보냅니다. | 승인 권한이 있는 키만 성공합니다. 수령 키는 한 번만 사용됩니다. | 로컬 Workers |
| TC-W-IMPL-03 | 두 사용자 소켓으로 동시에 조회하고 한쪽 등록을 해제합니다. | 각 결과는 본인에게만 갑니다. 다른 사용자 소켓은 열려 있습니다. | 로컬 Workers |
| TC-W-IMPL-04 | 저장소 루트에서 `pnpm build:worker`를 실행합니다. | 운영 도메인과 SQLite 객체를 대상으로 번들을 만듭니다. 실제 배포는 하지 않습니다. | 운영 설정의 모의 검사 |
| TC-W-IMPL-05 | 실제 Chrome에서 절전과 서버 복구를 확인합니다. | 현재 등록만 복구합니다. 이전 요청 결과는 재전송하지 않습니다. | 설치·원격 검증 예정 |
