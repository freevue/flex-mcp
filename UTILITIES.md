# flex MCP 유틸 계약

[LLM Wiki](LLM_WIKI.md) · [서비스 정책](SERVICE_POLICY.md) · [기능 목록](docs/features/README.md) · [공통 타입](docs/UTILITY_TYPES.md)

유틸은 한 가지 일을 맡는 함수입니다. 함수 하나에 문서 하나를 둡니다. 각 문서는 함수 이름, 매개변수의 타입과 필수 여부, 반환값, 실패 조건을 설명합니다. 날짜 함수 세 개는 현재 구현을 설명합니다. 나머지는 구현할 계약입니다.

TC는 테스트 케이스입니다. `TC-U`는 함수 하나의 입력과 결과를 확인합니다. `기존 테스트`는 서버 테스트 코드에 해당 검사가 있다는 뜻입니다. `예정`은 확인할 조건을 정했지만 이 문서가 실행 결과를 보증하지 않는다는 뜻입니다.

| 범위 | 유틸 |
| --- | --- |
| Chrome 조회 | [`readFlexJson`](docs/utilities/read-flex-json.md), [`readCurrentUser`](docs/utilities/read-current-user.md), [`parseAnnualLeave`](docs/utilities/parse-annual-leave.md), [`readAnnualLeave`](docs/utilities/read-annual-leave.md), [`readSchedule`](docs/utilities/read-schedule.md), [`readWorkHours`](docs/utilities/read-work-hours.md), [`runFlexQuery`](docs/utilities/run-flex-query.md) |
| 연결과 메시지 | [`connectBridge`](docs/utilities/connect-bridge.md), [`findFlexTab`](docs/utilities/find-flex-tab.md), [`dispatchToFlexTab`](docs/utilities/dispatch-to-flex-tab.md), [`attachBrowserBridge`](docs/utilities/attach-browser-bridge.md), [`forwardFlexQuery`](docs/utilities/forward-flex-query.md), [`parseBridgeRequest`](docs/utilities/parse-bridge-request.md), [`parseBridgeReply`](docs/utilities/parse-bridge-reply.md) |
| 한국 날짜와 기간 | [`seoulDate`](docs/utilities/seoul-date.md), [`shiftDate`](docs/utilities/shift-date.md), [`resolveRange`](docs/utilities/resolve-range.md) |
| 접근 권한과 상태 | [`authorizeMcpCaller`](docs/utilities/authorize-mcp-caller.md), [`resolveBrowserBinding`](docs/utilities/resolve-browser-binding.md), [`confirmBrowserBinding`](docs/utilities/confirm-browser-binding.md), [`revokeAccess`](docs/utilities/revoke-access.md), [`deriveConnectionState`](docs/utilities/derive-connection-state.md) |
| 공개 검사와 운영 | [`verifyPublicArtifact`](docs/utilities/verify-public-artifact.md), [`getServiceReadiness`](docs/utilities/get-service-readiness.md) |

도구별 결과는 각 기능 문서에 있습니다. 요청과 응답 형식, 오류 코드는 [원격 중계](docs/features/remote-bridge.md)에 있습니다. 같은 메시지 계약을 두 앱에서 사용하게 되면 공통 코드를 한 곳에서 관리합니다. 각 앱의 산출물에는 필요한 코드를 포함합니다.
