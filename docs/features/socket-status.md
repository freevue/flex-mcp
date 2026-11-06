# 내 Chrome 소켓 상태 조회

[기능 목록](README.md) · [사용자별 연결 흐름](shared-connection-flow.md) · [투두 11](https://github.com/freevue/flex-mcp/issues/11) · [투두 12](https://github.com/freevue/flex-mcp/issues/12)

`flex_get_socket_status`는 호출자 본인의 Chrome 소켓 상태를 확인합니다. 소켓은 확장과 서버 사이의 WebSocket 연결입니다. 이 도구는 인자를 받지 않습니다.

| `status` | 뜻 | 다음 작업 |
| --- | --- | --- |
| `unregistered` | 본인 계정에 연결한 Chrome 등록이 없습니다. | 확장 팝업에서 코드를 발급하고 에이전트에 승인을 요청합니다. |
| `offline` | 등록은 있지만 서버에서 열린 소켓을 찾지 못했습니다. | 등록한 Chrome의 확장과 연결 상태를 확인합니다. |
| `online` | 등록에 연결한 소켓이 조회 시점에 열려 있습니다. | 필요한 조회 도구를 호출합니다. |

이 도구는 확장에 메시지를 보내지 않습니다. 서버에서 등록과 소켓 상태를 읽습니다. 등록 ID, 접속 정보와 다른 사용자의 상태는 반환하지 않습니다. `online`은 Flex 탭, 로그인, 계정 일치 또는 실제 조회 성공을 확인한 값이 아닙니다. 합성 서버에서도 소켓 상태 자체는 실제 연결 상태입니다.

서버는 호출자의 권한을 확인합니다. 권한이 없으면 오류를 반환합니다. 조회 연결을 구성하지 않은 로컬 `stdio` 서버는 미연결 오류를 반환합니다.

## 확인할 경우

| TC | 실행 | 기대 결과 |
| --- | --- | --- |
| TC-F-SOCKET-01 | 허용한 두 사용자 중 한쪽의 소켓만 닫고 각각 조회합니다. | 첫 사용자는 `offline`, 둘째는 `online`입니다. |
| TC-F-SOCKET-02 | 사용자 한 명의 Chrome 등록을 해제하고 조회합니다. | 그 사용자에게 `unregistered`를 반환합니다. |
| TC-F-SOCKET-03 | 미등록 호출자로 요청하거나 다른 사용자의 등록 ID를 인자로 넣습니다. | 상태를 반환하지 않습니다. |

[서버 통합 테스트](../../apps/mcp-server/test/shared-remote.test.ts)에서 실제 HTTP와 합성 WebSocket 클라이언트로 확인합니다. 설치한 Chrome은 [직접 검증 절차](shared-connection-check.md)에서 확인합니다.
