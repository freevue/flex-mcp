# 유틸 공통 타입

[유틸 목록](../UTILITIES.md) · [기능 목록](features/README.md)

이 문서는 개별 유틸 시그니처의 타입을 설명합니다. 타입은 공개 코드에서 구현합니다. 브라우저와 서버가 공유하는 조회 계약은 [공통 코드](../shared/contracts.ts)에 둡니다. 실제 flex 응답이나 접근 정보는 예제로 사용하지 않습니다.

## 조회 타입

| 타입 | 뜻 |
| --- | --- |
| `DateRange` | `from`과 `to`가 각각 문자열인 날짜 범위입니다. 두 날짜는 `YYYY-MM-DD`입니다. |
| `FlexQuery` | `kind`가 `leave`이면 기간이 없습니다. `schedule`이나 `work`이면 `range`가 필요합니다. |
| `FlexPageContext` | 선택한 탭의 출처와 확장 안에서 읽기 요청을 실행할 수 있는 문맥입니다. 서버 메시지에서 받지 않습니다. `origin`, 읽기 함수 `read(request, signal)`, 선택 항목인 시각 함수 `now()`를 제공합니다. |
| `TabRuntime` | 선택한 탭에서 문서 ID와 주소를 읽고, 해당 문서에서 확장에 포함된 조회를 실행하는 함수 모음입니다. 실제 Chrome API 연동은 별도 작업입니다. |
| `FlexReadRequest` | 확장에서 고른 현재 계정, 연차, 기본 캘린더, 일정, 반복 일정, 근무 집계의 읽기 요청입니다. 조회에 필요한 로컬 식별자나 기간만 담습니다. 주소와 실행 코드는 받지 않습니다. |
| `BrowserUser` | 확장 안에서만 비교하는 현재 계정 식별자입니다. |
| `AnnualLeaveResult`, `ScheduleResult`, `WorkHoursResult` | [연차](features/annual-leave.md), [일정](features/schedule.md), [근무 시간](features/work-hours.md)의 결과입니다. |
| `FlexResult` | 세 조회 결과 중 하나입니다. 실제 종류는 요청에 따라 정합니다. |
| `Outcome<Value, Failure>` | 성공이면 `ok: true`와 `value`를 담습니다. 실패이면 `ok: false`와 `error`를 담습니다. 함수 내부에서 쓰는 형식입니다. |
| `FlexRequestFailure` | `FLEX_REAUTH_REQUIRED` 또는 `FLEX_READ_FAILED`입니다. |
| `FlexReadFailure` | `FlexRequestFailure` 또는 `FLEX_NO_RECORDS`입니다. |
| `BrowserQueryFailure` | `FlexReadFailure`, `FLEX_TAB_UNAVAILABLE`, `FLEX_ACCOUNT_MISMATCH` 중 하나입니다. |

## 연결과 접근 타입

| 타입 | 뜻 |
| --- | --- |
| `BridgeRequest`, `BridgeReply` | [원격 중계](features/remote-bridge.md)의 요청과 응답입니다. `Outcome`과 별도입니다. |
| `BridgeConfig` | 확장에 승인한 서버 주소, 재시도 간격, 접속권을 받는 함수와 소켓을 여는 함수입니다. 상태 알림 함수는 선택입니다. 조회 요청의 일부가 아닙니다. |
| `BridgeControl` | 연결 상태를 확인하고 연결을 종료할 수 있는 값입니다. |
| `TabCandidate`, `FlexTab` | 앞의 타입은 현재 프로필에서 얻은 탭의 ID, 주소와 선택 항목인 최근 사용 시각입니다. 뒤의 타입은 ID와 주소를 확인한 Flex 탭입니다. |
| `VerifiedCallerIdentity`, `VerifiedOwnerIdentity` | 서버에서 신원을 확인한 에이전트와 소유자입니다. 에이전트 신원에는 `callerId`와 `ownerId`가 있습니다. 요청 본문의 값으로 만들지 않습니다. |
| `AuthorizedCaller` | 해당 조회에 접근할 수 있다고 확인한 에이전트입니다. |
| `AccessState` | 호출자에서 사용자 ID를 찾고, 사용자별 등록을 확인하거나 해제하는 함수 모음입니다. |
| `BrowserBinding` | 서버가 발급한 `bindingId`와 해당 사용자의 `ownerId`입니다. |
| `ApprovedBrowserTarget` | 서버가 확장에 연결을 허용한 프로필입니다. |
| `LocalBrowserBinding` | 확장이 연결한 프로필과 계정을 대조하는 로컬 정보입니다. |
| `BrowserConnection`, `BridgeRegistry` | 앞의 타입은 서버가 확인한 확장 연결입니다. 뒤의 타입은 활성 연결과 대기 요청을 관리하는 상태입니다. |
| `RelayContext` | 현재 권한, 연결 상태, 요청 시간 제한과 대기 상한을 중계 함수에 제공합니다. 요청 ID는 서버에서 발급합니다. |
| `ToolHandlers` | Node MCP 내부 타입입니다. `query`는 조회를 실행합니다. `connectionStatus`와 `approveConnection`은 연결 기능을 제공합니다. |
| `ToolFailure` | 조회, 권한과 소켓 상태를 분류하는 Node MCP 내부 오류 타입입니다. |
| `StateDatabase` | Node와 Durable Object가 공유하는 SQLite 호출 계약입니다. `exec`, `prepare`와 선택적인 `transactionSync`를 제공합니다. |
| `RemoteConfiguration` | 공개 Node 서버의 `origin`과 허용한 확장의 `extensionOrigins`를 담습니다. |
| `RelayFailure` | [중계 오류](features/remote-bridge.md) 또는 서버가 처리하는 `ACCESS_DENIED`, `QUERY_LIMIT_REACHED`입니다. 서버의 접근 거부와 상한 초과는 확장으로 보내는 코드가 아닙니다. |
| `AccessFailure` | 호출자를 확인하지 못한 `CALLER_UNVERIFIED`와 권한이 없는 `ACCESS_DENIED`를 구분합니다. |
| `BindingFailure` | `FlexRequestFailure` 또는 사용자가 연결을 취소한 `BINDING_CANCELLED`입니다. 이 취소 상태는 확장 안에서만 사용합니다. |
| `RevocationTarget` | 해제할 에이전트나 프로필을 가리키는 값입니다. |
| `ConnectionSnapshot`, `ConnectionState` | 앞의 타입은 연결과 마지막 조회 확인 상태입니다. 뒤의 타입은 [확장 안내](features/extension-setup.md)에 표시할 상태와 다음 행동입니다. |

## 팝업과 승인 타입

| 타입 | 뜻 |
| --- | --- |
| `ExtensionConfiguration` | 빌드에서 정한 서버 주소와 합성 모드 여부입니다. |
| `DevicePairingStart` | 화면에 표시할 승인 코드와 비공개 요청 키, 만료 시각입니다. |
| `DevicePairingClaim` | 승인 대기, 사용할 수 없음, 등록 완료 또는 추가 연결 완료입니다. 등록 완료 응답에만 등록 ID와 확장 키가 있습니다. |
| `PopupCommand`, `PopupSnapshot` | 팝업에서 워커로 보내는 행동 이름과 워커가 돌려주는 표시 상태입니다. 표시 상태에는 비공개 키가 없습니다. |
| `WorkSummaryInput`, `PopupWorkSummary` | 앞의 타입은 근무 요약 계산에 쓰는 분 단위 입력입니다. 뒤의 타입은 팝업에 표시할 실제 근무, 연차, 오늘 기준 남은 시간과 예상치입니다. |
| `WorkWeekday` | 일요일 0부터 토요일 6까지의 요일입니다. |

## 검사와 운영 타입

| 타입 | 뜻 |
| --- | --- |
| `PublicArtifactPolicy` | 대상 앱의 압축 형식과 필수 파일 경로, 정확히 허용한 경로 목록입니다. |
| `ArtifactCheckResult` | 검사 성공 여부와 실패 종류입니다. 민감한 값은 넣지 않습니다. |
| `ServiceReadinessInput` | 필수 설정 여부, 운영 중단 여부, 승인된 브라우저 연결 여부입니다. |
| `ServiceReadiness` | 서버의 `acceptsRequests`와 운영자용 `browserOnline`을 구분합니다. 서버가 요청을 받을 수 있어도 브라우저 조회가 가능하다는 뜻은 아닙니다. |

Workers의 `WorkerEnvironment`는 `BRIDGE` 바인딩과 선택 항목 `FLEX_PUBLIC_ORIGIN`을 담습니다. 도구는 연결 키로 채널을 찾습니다. [Workers 구현](mcp/worker-implementation.md)을 참고하세요.
