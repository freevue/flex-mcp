# MCP 서버 함수 목록

[도구 목록](README.md) · [공통 타입](../UTILITY_TYPES.md) · [Workers 현재 함수](worker-implementation.md) · [Workers 예정 함수](workers/README.md) · [전체 유틸 목록](../../UTILITIES.md)

아래 함수는 현재 저장소의 Node 서버와 공통 코드에 있습니다. 함수마다 매개변수, 결과와 테스트 케이스를 둡니다. 함수 안에서만 쓰는 이름과 외부로 내보내는 이름을 구분합니다.

| 역할 | 함수 |
| --- | --- |
| 도구 생성 | [createMcpServer](../utilities/create-mcp-server.md), [createPairedMcpServer](../utilities/create-paired-mcp-server.md), [createCallerMcpServer](../utilities/create-caller-mcp-server.md) |
| 입력과 응답 | [buildRange](../utilities/build-range.md), [reply](../utilities/reply.md), [errorReply](../utilities/error-reply.md), [successReply](../utilities/success-reply.md) |
| 한국 날짜 | [seoulDate](../utilities/seoul-date.md), [shiftDate](../utilities/shift-date.md), [resolveRange](../utilities/resolve-range.md) |
| 호출자 권한 | [authorizeMcpCaller](../utilities/authorize-mcp-caller.md), [resolveBrowserBinding](../utilities/resolve-browser-binding.md), [revokeAccess](../utilities/revoke-access.md) |
| 소켓과 요청 | [attachBrowserBridge](../utilities/attach-browser-bridge.md), [forwardFlexQuery](../utilities/forward-flex-query.md), [disconnect](../utilities/disconnect.md), [finish](../utilities/finish.md) |
| 중계 응답 | [parseBridgeReply](../utilities/parse-bridge-reply.md), [isResult](../utilities/is-result.md), [isBridgeError](../utilities/is-bridge-error.md) |
| 상태와 운영 | [getBrowserConnectionStatus](../utilities/get-browser-connection-status.md), [getServiceReadiness](../utilities/get-service-readiness.md) |
| Node HTTP | [createRemoteServer](../utilities/create-remote-server.md), [handle](../utilities/handle-http.md), [handleMcp](../utilities/handle-mcp.md), [readBearer](../utilities/read-bearer.md), [readJson](../utilities/read-json.md), [sendJson](../utilities/send-json.md) |
| Node 등록과 소켓 인증 | [handleRegistration](../utilities/handle-registration.md), [authenticateBrowserSocket](../utilities/authenticate-browser-socket.md), [decode](../utilities/decode-socket-message.md), [reconcileBrowserAccess](../utilities/reconcile-browser-access.md) |
| 최초 등록과 추가 연결 | [startDevicePairing](../utilities/start-device-pairing.md), [startChannelInvitation](../utilities/start-channel-invitation.md), [approveDevicePairing](../utilities/approve-device-pairing.md), [claimDevicePairing](../utilities/claim-device-pairing.md) |
| 등록 교체와 기존 호환 | [replaceBrowserRegistration](../utilities/replace-browser-registration.md), [issuePairingCode](../utilities/issue-pairing-code.md), [redeemPairingCode](../utilities/redeem-pairing-code.md) |
| 이전 키 도구 | [issueAgentKey](../utilities/issue-agent-key.md), [verifyAgentKey](../utilities/verify-agent-key.md) |
| 확장 키와 접속권 | [verifyDeviceKey](../utilities/verify-device-key.md), [issueBridgeTicket](../utilities/issue-bridge-ticket.md), [consumeBridgeTicket](../utilities/consume-bridge-ticket.md) |
| 저장과 비공개 값 | [openStateDatabase](../utilities/open-state-database.md), [createAccessState](../utilities/create-access-state.md), [asBrowserBinding](../utilities/as-browser-binding.md), [requireOwnerId](../utilities/require-owner-id.md), [createSecret](../utilities/create-secret.md), [secretDigest](../utilities/secret-digest.md), [isSecret](../utilities/is-secret.md) |
| 결과 표현 | [success](../utilities/success.md), [failure](../utilities/failure.md) |
| 공통 입력 검사 | [isRecord](../utilities/is-record.md), [hasKeys](../utilities/has-keys.md), [isDate](../utilities/is-date.md), [isTime](../utilities/is-time.md), [isDateRange](../utilities/is-date-range.md), [isQuery](../utilities/is-query.md), [isRequestId](../utilities/is-request-id.md) |
| 공통 결과 검사 | [isLeaveBalance](../utilities/is-leave-balance.md), [isScheduleEvent](../utilities/is-schedule-event.md), [isWorkTotals](../utilities/is-work-totals.md), [isExpectedRange](../utilities/is-expected-range.md) |
| 출처와 주소 | [parseUrl](../utilities/parse-url.md), [isFlexUrl](../utilities/is-flex-url.md), [parseBridgeOrigin](../utilities/parse-bridge-origin.md), [isExtensionOrigin](../utilities/is-extension-origin.md) |
| 확장에서 실행 | [parseBridgeRequest](../utilities/parse-bridge-request.md), [dispatchToFlexTab](../utilities/dispatch-to-flex-tab.md), [runFlexQuery](../utilities/run-flex-query.md), [createSyntheticReply](../utilities/create-synthetic-reply.md) |
| 놀수 계산 | [calculateWorkSummary](../utilities/calculate-work-summary.md), [근무 요약 도구와 로컬 호출 흐름](tools/flex-get-work-summary.md) |
| 공개 산출물 | [verifyPublicArtifact](../utilities/verify-public-artifact.md) |

`AccessState`가 반환하는 [findOwner](../utilities/find-owner.md), [findBinding](../utilities/find-binding.md), [removeCaller](../utilities/remove-caller.md), [removeBinding](../utilities/remove-binding.md)은 Node 저장소 접근 함수입니다. 소켓 어댑터의 `isOpen`, `send`, `close`, `onClose`, `onReply`는 [소켓 인증 함수](../utilities/authenticate-browser-socket.md)에서 설명합니다.

본인 PC에서만 사용하는 조회 함수는 로컬 MCP 문서에 둡니다. 공개 저장소에는 실제 조회 주소와 개인 결과를 넣지 않습니다.
