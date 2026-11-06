# flex_approve_connection

[도구 목록](../README.md) · [Chrome 등록](../../features/browser-pairing.md) · [투두 17](https://github.com/freevue/flex-mcp/issues/17)

Chrome 팝업의 일회용 코드를 확인합니다. 별도 사용자 ID, 클라이언트 등록과 연결 키는 이 호출에 필요하지 않습니다.

| 인자 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `approvalCode` | `string` | 필수 | 팝업의 코드입니다. 영문 대문자 A부터 F와 숫자로 된 네 자리 묶음 세 개입니다. |

서버는 `{ status: "approved", connectionKey }`를 반환합니다. `connectionKey`는 문자열이며 한 채널의 조회에만 사용합니다. 확장이 승인 결과를 수령한 뒤 사용할 수 있습니다. 키를 URL, 공개 메시지나 로그에 넣지 않습니다.

[approveDevicePairing](../../utilities/approve-device-pairing.md)이 만료 시각과 사용 이력을 확인합니다. [claimDevicePairing](../../utilities/claim-device-pairing.md)이 요청 키로 처음 확장을 확인합니다.

| TC | 조건 | 기대 결과 |
| --- | --- | --- |
| TC-MCP-APPROVE-01 | 유효한 코드를 처음 보냅니다. | 연결 키가 한 번 나옵니다. |
| TC-MCP-APPROVE-02 | 코드가 틀렸거나 만료됐거나 사용한 코드입니다. | 연결 키를 반환하지 않습니다. |
| TC-MCP-APPROVE-03 | 승인 뒤 확장이 아직 등록을 받지 않았습니다. | 연결 키로 조회할 수 없습니다. |
| TC-MCP-APPROVE-04 | 처음 요청한 확장이 등록을 받습니다. | 연결 키는 그 채널의 조회에만 사용할 수 있습니다. |
