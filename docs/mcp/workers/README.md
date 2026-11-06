# Workers 예정 함수

[배포 설계](../cloudflare-workers.md) · [검증과 배포](../workers-release.md) · [현재 서버 함수](../functions.md)

아래 이름은 운영 전환에 사용할 계약입니다. 합성 검증 Worker는 일부 동작을 기존 Node 함수로 처리합니다. 현재 구현과 검증 범위는 [Workers 구현 문서](../worker-implementation.md)에서 확인합니다.

| 범위 | 함수 |
| --- | --- |
| 외부 요청 | [handleWorkerRequest](handle-worker-request.md) |
| 도구에서 객체로 | [queryForCaller](query-for-caller.md), [statusForCaller](status-for-caller.md), [approveForCaller](approve-for-caller.md) |
| 소켓 | [acceptExtensionSocket](accept-extension-socket.md), [webSocketMessage](websocket-message.md), [webSocketClose](websocket-close.md), [webSocketError](websocket-error.md) |
| 놀수와 요약 | [loadNolsuDates](load-nolsu-dates.md), [getWorkerWorkSummary](get-worker-work-summary.md) |

`WorkerEnv`는 환경별 도메인, 출처 허용 목록, OAuth 서비스와 `FlexBridge` 바인딩을 담습니다. `WorkerCaller`는 서버가 확인한 `callerId`, `ownerId`와 유효한 권한을 담습니다. 외부 요청에서 이 객체를 직접 받지 않습니다.

`WorkSummaryResult`는 [근무 요약 도구의 결과](../tools/flex-get-work-summary.md)입니다. `WorkerFailure`는 현재의 [중계 오류](../../features/remote-bridge.md)와 권한 거부를 포함합니다. HTTP와 MCP의 오류 형태를 구분합니다. 인증과 등록에는 원문 키를 오류로 반환하지 않습니다.
