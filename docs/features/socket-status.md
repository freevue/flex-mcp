# Chrome 소켓 상태 조회

[기능 목록](README.md) · [연결 흐름](shared-connection-flow.md) · [도구 계약](../mcp/tools/flex-get-socket-status.md)

소켓은 확장과 서버 사이의 WebSocket 연결입니다. 원격 `flex_get_socket_status`는 승인 때 받은 `connectionKey`로 해당 채널만 확인합니다.

| 결과 | 뜻 | 다음 작업 |
| --- | --- | --- |
| `offline` | 채널은 등록됐지만 소켓이 닫혀 있습니다. | 등록한 Chrome의 확장과 연결 상태를 확인합니다. |
| `online` | 채널의 소켓이 열려 있습니다. | 필요한 조회 도구를 호출합니다. |
| 호출 오류 | 연결 키가 없거나 유효하지 않습니다. | 사용할 연결 키를 확인합니다. 등록을 해제했다면 새 코드를 발급합니다. |

이 도구는 확장에 메시지를 보내지 않습니다. 등록 ID, 키와 다른 채널의 상태를 반환하지 않습니다. `online`은 Flex 탭이나 로그인 상태를 뜻하지 않습니다. 공개 로컬 `stdio` 서버는 미연결 오류를 반환합니다.

| TC | 실행 | 기대 결과 |
| --- | --- | --- |
| TC-F-SOCKET-01 | 확장이 등록을 받고 소켓을 엽니다. | 상태가 `offline`에서 `online`으로 바뀝니다. |
| TC-F-SOCKET-02 | 두 채널 중 하나를 해제합니다. | 해제한 키를 거부합니다. 다른 채널은 `online`입니다. |
| TC-F-SOCKET-03 | 키 없이 호출하거나 등록 ID를 추가합니다. | 상태를 반환하지 않습니다. |

[서버 통합 테스트](../../apps/mcp-server/test/shared-remote.test.ts)는 실제 HTTP와 합성 WebSocket을 사용합니다. 설치한 Chrome은 [직접 검증 절차](shared-connection-check.md)를 따릅니다.
