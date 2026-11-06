# flex_approve_connection

[도구 목록](../README.md) · [Chrome 등록 순서](../../features/browser-pairing.md)

Chrome 확장이 발급받아 표시한 코드를 승인합니다. 사용자가 본인의 연결 승인을 요청한 경우에만 호출합니다. 연결 승인 권한이 필요합니다.

| 인자 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `approvalCode` | `string` | 필수 | 영문 대문자 A부터 F와 숫자로 된 네 자리 묶음 세 개입니다. 묶음 사이에 하이픈을 씁니다. 5분 동안 유효합니다. |

성공 결과는 `{ status: "approved" }`입니다. 확장 키, 요청 키와 등록 ID는 반환하지 않습니다. 성공은 요청을 승인했다는 뜻입니다. 확장이 아직 등록을 받거나 소켓을 열지 않았을 수 있습니다.

[createCallerMcpServer](../../utilities/create-caller-mcp-server.md)가 인증한 신원에 승인 함수를 연결합니다. [approveDevicePairing](../../utilities/approve-device-pairing.md)이 승인 권한과 코드를 확인합니다. 처음 요청한 확장이 비공개 요청 키로 [claimDevicePairing](../../utilities/claim-device-pairing.md)을 실행할 때만 등록을 교체합니다.

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-MCP-APPROVE-01 | 승인 권한이 있는 키로 유효한 코드를 보냅니다. | 승인 상태만 반환합니다. 확장이 수령하기 전에는 등록을 바꾸지 않습니다. | [원격 Node 통합](../../../apps/mcp-server/test/shared-remote.test.ts) |
| TC-MCP-APPROVE-02 | 조회 전용 키 또는 재사용한 코드를 보냅니다. | `ACCESS_DENIED`입니다. | [원격 Node 통합](../../../apps/mcp-server/test/shared-remote.test.ts) |
| TC-MCP-APPROVE-03 | 만료된 코드나 승인 뒤 권한을 회수한 호출을 확인합니다. | 새 등록을 발급하지 않습니다. 기존 등록은 유지합니다. | [등록 검사](../../../apps/mcp-server/test/registration.test.ts) |
| TC-MCP-APPROVE-04 | 설치한 Chrome에서 발급하고 에이전트가 승인합니다. | 처음 요청한 확장만 등록을 받고 소켓을 엽니다. | 설치한 Chrome과 Workers에서 확인 예정 |
