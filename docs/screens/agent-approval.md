# MCP 클라이언트에서 연결 승인

[Chrome 등록과 재접속](../features/browser-pairing.md) · [승인 도구](../mcp/tools/flex-approve-connection.md)

운영 MCP 주소는 `https://flex-mcp.freevue.dev/mcp`입니다. 새 에이전트의 MCP 설정에 이 주소를 등록합니다. 전송 방식은 `Streamable HTTP`입니다.

## 복사해서 보낼 요청문

아래 문장을 새 에이전트의 대화에 붙여 넣으세요.

```text
Flex MCP를 아래 주소로 등록해줘.
주소: https://flex-mcp.freevue.dev/mcp
전송 방식: Streamable HTTP

등록한 뒤 나에게 일회용 승인 코드를 요청해줘.
내가 코드를 보내면 flex_approve_connection의 approvalCode에 넣어 호출해줘.
승인으로 받은 connectionKey를 대화에 표시하지 말고, flex_get_socket_status에 넣어 연결 상태만 알려줘.
이후 Flex 조회에도 같은 connectionKey를 사용해줘.
```

코드 요청을 받으면 연결된 Chrome 확장 팝업에서 `코드 확인`을 누르세요. 코드를 복사하므로 같은 대화에 붙여 넣으세요. 코드는 5분 동안 한 번만 사용할 수 있습니다. 다음 에이전트를 등록할 때는 앞선 승인을 끝낸 뒤 다시 `코드 확인`을 누르세요.

기존 채널에 추가한 키는 승인 직후 사용할 수 있습니다. 기존 에이전트의 연결과 키는 유지됩니다. 최초 등록이면 확장이 승인 결과를 받아 소켓에 연결할 때까지 기다리세요.

| 확인할 경우                          | 기대 결과                 |
| ------------------------------------ | ------------------------- |
| 유효한 코드를 제출합니다.            | 연결 키를 한 번 받습니다. |
| 코드가 만료됐거나 이미 사용했습니다. | 연결 키를 받지 못합니다.  |
