# flex MCP 유틸 계약

[LLM Wiki](LLM_WIKI.md) · [서비스 정책](SERVICE_POLICY.md) · [기능 목록](docs/features/README.md) · [공통 타입](docs/UTILITY_TYPES.md)

유틸은 한 가지 일을 맡는 함수입니다. MCP에 쓰는 함수는 [서버 함수 목록](docs/mcp/functions.md)에서 호출 흐름별로 찾습니다. 함수 하나에 문서 하나를 둡니다. 각 문서는 함수 이름, 매개변수의 타입과 필수 여부, 반환값, 실패 조건을 설명합니다. 목록은 공개 코드로 구현한 함수의 계약입니다. 브라우저와 네트워크를 대신하는 테스트 입력과 실제 운영 연결은 구분합니다.

TC는 테스트 케이스입니다. `TC-U`는 함수 하나의 입력과 결과를 확인합니다. `기존 테스트`와 `로컬 테스트`는 해당 조건을 검사하는 코드가 있다는 뜻입니다. `로컬 패키징`은 실제 공개 압축 파일을 만들고 검사했다는 뜻입니다. `예정`은 이 작업에서 확인하지 않은 조건입니다.

| 범위 | 유틸 |
| --- | --- |
| Chrome 조회 | [`readFlexJson`](docs/utilities/read-flex-json.md), [`readCurrentUser`](docs/utilities/read-current-user.md), [`parseAnnualLeave`](docs/utilities/parse-annual-leave.md), [`readAnnualLeave`](docs/utilities/read-annual-leave.md), [`readSchedule`](docs/utilities/read-schedule.md), [`readWorkHours`](docs/utilities/read-work-hours.md), [`runFlexQuery`](docs/utilities/run-flex-query.md) |
| 연결과 메시지 | [`connectBridge`](docs/utilities/connect-bridge.md), [`findFlexTab`](docs/utilities/find-flex-tab.md), [`dispatchToFlexTab`](docs/utilities/dispatch-to-flex-tab.md), [`attachBrowserBridge`](docs/utilities/attach-browser-bridge.md), [`forwardFlexQuery`](docs/utilities/forward-flex-query.md), [`parseBridgeRequest`](docs/utilities/parse-bridge-request.md), [`parseBridgeReply`](docs/utilities/parse-bridge-reply.md) |
| 한국 날짜와 기간 | [`seoulDate`](docs/utilities/seoul-date.md), [`shiftDate`](docs/utilities/shift-date.md), [`resolveRange`](docs/utilities/resolve-range.md) |
| 접근 권한과 상태 | [`authorizeMcpCaller`](docs/utilities/authorize-mcp-caller.md), [`resolveBrowserBinding`](docs/utilities/resolve-browser-binding.md), [`confirmBrowserBinding`](docs/utilities/confirm-browser-binding.md), [`revokeAccess`](docs/utilities/revoke-access.md), [`deriveConnectionState`](docs/utilities/derive-connection-state.md) |
| 공개 검사와 운영 | [`verifyPublicArtifact`](docs/utilities/verify-public-artifact.md), [`getServiceReadiness`](docs/utilities/get-service-readiness.md), [`getBrowserConnectionStatus`](docs/utilities/get-browser-connection-status.md) |

도구별 결과는 각 기능 문서에 있습니다. 요청과 응답 형식, 오류 코드는 [원격 중계](docs/features/remote-bridge.md)에 있습니다. 두 앱이 사용하는 메시지 계약은 [공통 코드](shared/index.ts)에서 관리합니다. 각 앱의 산출물에는 필요한 코드를 포함합니다.

`issuePairingCode`, `redeemPairingCode`와 `pairBrowser`는 이전 호환 API에서 운영자 발급 코드를 씁니다. 새 팝업은 [확장이 시작하는 승인 흐름](docs/features/browser-pairing.md)을 씁니다.

| 공유 연결 등록과 인증 | 유틸 문서 |
| --- | --- |
| 서버와 공통 코드 | [`parseBridgeOrigin`](docs/utilities/parse-bridge-origin.md), [`issueAgentKey`](docs/utilities/issue-agent-key.md), [`verifyAgentKey`](docs/utilities/verify-agent-key.md), [`issuePairingCode`](docs/utilities/issue-pairing-code.md), [`redeemPairingCode`](docs/utilities/redeem-pairing-code.md), [`verifyDeviceKey`](docs/utilities/verify-device-key.md), [`issueBridgeTicket`](docs/utilities/issue-bridge-ticket.md), [`consumeBridgeTicket`](docs/utilities/consume-bridge-ticket.md), [`createAccessState`](docs/utilities/create-access-state.md), [`createRemoteServer`](docs/utilities/create-remote-server.md) |
| Chrome 등록 | [`pairBrowser`](docs/utilities/pair-browser.md), [`requestBridgeTicket`](docs/utilities/request-bridge-ticket.md), [`unpairBrowser`](docs/utilities/unpair-browser.md) |

소켓 등록과 검사: [`openStateDatabase`](docs/utilities/open-state-database.md), [`authenticateBrowserSocket`](docs/utilities/authenticate-browser-socket.md), [`reconcileBrowserAccess`](docs/utilities/reconcile-browser-access.md), [`createSyntheticReply`](docs/utilities/create-synthetic-reply.md).

| 팝업과 에이전트 승인 | 유틸 문서 |
| --- | --- |
| `startDevicePairing` | [함수 계약](docs/utilities/start-device-pairing.md) |
| `approveDevicePairing` | [함수 계약](docs/utilities/approve-device-pairing.md) |
| `claimDevicePairing` | [함수 계약](docs/utilities/claim-device-pairing.md) |
| `requestDevicePairing` | [함수 계약](docs/utilities/request-device-pairing.md) |
| `pollDevicePairing` | [함수 계약](docs/utilities/poll-device-pairing.md) |
| `calculateWorkSummary` | [함수 계약](docs/utilities/calculate-work-summary.md) |
| `formatWorkMinutes` | [함수 계약](docs/utilities/format-work-minutes.md) |
| `readPopupSnapshot` | [함수 계약](docs/utilities/read-popup-snapshot.md) |
| `loadExtensionConfiguration` | [함수 계약](docs/utilities/load-extension-configuration.md) |
| `calculateRestTargetMinutes` | [함수 계약](docs/utilities/calculate-rest-target-minutes.md) |
| `getWorkSummaryRanges` | [함수 계약](docs/utilities/get-work-summary-ranges.md) |
| `createDemoWorkTotals` | [함수 계약](docs/utilities/create-demo-work-totals.md) |
| `readDemoWorkSummary` | [함수 계약](docs/utilities/read-demo-work-summary.md) |
| `readDevicePairingStart` | [함수 계약](docs/utilities/read-device-pairing-start.md) |
| `replaceBrowserRegistration` | [함수 계약](docs/utilities/replace-browser-registration.md) |
