# 원격 MCP와 Chrome 확장 중계

[투두 4](https://github.com/freevue/flex-mcp/issues/4) · [서비스 정책](../../SERVICE_POLICY.md) · [접근 권한](access-control.md) · [Workers 이식](../mcp/cloudflare-workers.md)

중계는 서버와 확장 사이에서 요청과 결과를 전달하는 기능입니다. 에이전트는 [Streamable HTTP](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#streamable-http)를 사용합니다. 등록을 받은 확장은 WSS 연결을 엽니다. 서버는 연결을 승인한 뒤 조회를 보냅니다. 공개 확장은 합성 데이터를 보냅니다. [개인 설치본](extension-setup.md)은 Chrome에서 읽은 도구 결과를 보냅니다. [최초 등록과 승인](browser-pairing.md), [등록 이후의 중계](shared-connection-flow.md)를 따릅니다.

## 메시지 계약

서버는 등록 ID로 활성 소켓을 찾습니다. 서버는 조회마다 고유한 `requestId`를 붙입니다. 확장은 요청의 형태를 검사합니다. 성공 응답에는 같은 `requestId`와 `result`만 넣습니다. 실패 응답에는 같은 `requestId`와 `error` 코드만 넣습니다. 오류 문구는 서버에서 만듭니다.

```json
{"requestId":"example-request","query":{"kind":"leave"}}
```

```json
{"requestId":"example-request","error":"FLEX_REAUTH_REQUIRED"}
```

`kind`는 `leave`, `schedule`, `work` 중 하나입니다. `leave`에는 기간을 넣지 않습니다. `schedule`과 `work`에는 `range.from`과 `range.to`를 넣습니다. 사번, URL, 실행 코드와 알 수 없는 필드는 거부합니다. 결과 필드는 [연차](annual-leave.md), [일정](schedule.md), [근무 시간](work-hours.md)의 계약을 따릅니다.

[월 근무 요약](../mcp/tools/flex-get-work-summary.md)은 여러 근무 범위를 읽어 결과를 계산합니다. 이식할 때 기존 `work` 메시지를 재사용합니다. 확장 메시지에 새 조회 종류나 사용자 ID를 추가하지 않습니다.

| 코드 | 반환 조건 |
| --- | --- |
| `BROWSER_OFFLINE` | 등록한 연결이 없거나 결과가 오기 전에 끊겼습니다. |
| `FLEX_TAB_UNAVAILABLE` | 조회할 flex 탭이 없거나 조회 중 탭이 닫혔습니다. |
| `FLEX_REAUTH_REQUIRED` | flex가 다시 로그인을 요구합니다. |
| `FLEX_ACCOUNT_MISMATCH` | 탭의 현재 계정이 연결한 계정과 다릅니다. |
| `FLEX_NO_RECORDS` | flex가 요청한 잔액이나 근무 기록이 없다고 명시합니다. |
| `FLEX_READ_FAILED` | 조회가 실패했거나 필수 결과를 확인할 수 없습니다. |
| `QUERY_TIMEOUT` | 연결은 유지됐지만 정한 시간 안에 결과가 오지 않았습니다. |
| `INVALID_BRIDGE_MESSAGE` | 요청이나 응답이 정한 형태를 벗어났습니다. |

접근 거부는 브라우저 오류와 구분합니다. 서버는 권한 확인에 실패하면 확장으로 요청을 보내지 않습니다. 운영 중 권한이 해제되면 대기 중인 결과를 보내지 않습니다.

## 연결과 검증

Node는 같은 주소에서 `/mcp`와 `/bridge`를 제공합니다. HTTPS와 WSS를 사용하는 프록시는 경로를 그대로 전달합니다. 로컬 합성 검증은 `127.0.0.1`에서만 암호화하지 않은 연결을 허용합니다. 서버는 허용한 확장 출처와 일회용 접속권을 모두 확인합니다. 인증과 실패 조건은 [Chrome 등록](browser-pairing.md)과 [사용자 권한](access-control.md)에 있습니다.

확장은 [연결 함수](../utilities/connect-bridge.md)로 연결합니다. 서버는 [브라우저 연결을 등록](../utilities/attach-browser-bridge.md)합니다. 서버는 [조회 전달](../utilities/forward-flex-query.md)에서 호출자와 연결을 확인합니다. 양쪽은 [요청 검사](../utilities/parse-bridge-request.md)와 [응답 검사](../utilities/parse-bridge-reply.md)를 사용합니다. 확장은 [탭 전달 함수](../utilities/dispatch-to-flex-tab.md)로 패키지에 포함된 코드를 실행합니다.

합성 연결에서 두 에이전트의 요청을 섞어 보냅니다. 같은 연결과 요청 ID의 결과만 반환하는지 확인합니다. 만료, 중복, 이전 연결에서 온 응답은 무시합니다. 연결이 끊기면 대기 요청을 종료합니다. 다시 연결한 뒤 예전 조회가 실행되지 않는지 확인합니다.

실제 조회 성공 응답에는 최상위에 `source: "flex"`를 보냅니다. 서버는 이 표시를 제거하고 도구 결과만 반환합니다. 출처 표시가 없는 이전 확장의 응답과 공개 합성 응답에는 `synthetic: true`를 붙입니다. 출처 표시가 있어도 계정이나 Flex 원본 응답은 받지 않습니다.

## 테스트 케이스

연결한 테스트는 로컬에서 확인했습니다. Chrome이나 원격 환경이 필요한 항목은 예정입니다.

| TC | 확인 범위 | 준비와 실행 | 기대 결과 |
| --- | --- | --- | --- |
| TC-F-REMOTE-BRIDGE-01 | 합성 연결 · [로컬 테스트](../../apps/mcp-server/test/relay.test.ts) | 허용된 두 에이전트가 동시에 연차를 요청합니다. 나중 요청의 응답을 먼저 보냅니다. | 각 응답이 같은 요청 ID를 기다리는 에이전트에게만 돌아갑니다. |
| TC-F-REMOTE-BRIDGE-02 | 합성 연결 · [로컬 테스트](../../apps/mcp-server/test/relay.test.ts) | 연결 끊김과 연결 유지 상태의 시간 초과를 각각 재현합니다. | `BROWSER_OFFLINE`과 `QUERY_TIMEOUT`을 구분합니다. 종료한 요청의 결과는 보내지 않습니다. |
| TC-F-REMOTE-BRIDGE-03 | 합성 연결 · [로컬 테스트](../../apps/mcp-server/test/relay.test.ts) | 연결을 교체한 뒤 이전 연결의 응답과 중복 응답을 보냅니다. | 이전 연결의 응답을 버립니다. 유효한 응답은 한 번만 전달합니다. |
| TC-F-REMOTE-BRIDGE-04 | 합성 연결 · [확장 테스트](../../apps/chrome-extension/test/bridge.test.ts), [서버 테스트](../../apps/mcp-server/test/relay.test.ts) | 임의 주소나 사번을 담은 요청과 다른 도구 형식의 응답을 보냅니다. | 형식이 틀린 메시지를 거부합니다. 잘못된 요청은 Chrome 조회를 시작하지 않습니다. |
| TC-F-REMOTE-BRIDGE-05 | 원격 검증 | 허용한 두 에이전트가 같은 Chrome 프로필에 원격 연차 조회를 요청합니다. | 각 에이전트는 자신의 요청 결과만 받습니다. 확장은 재연결 뒤 예전 조회를 다시 실행하지 않습니다. |
