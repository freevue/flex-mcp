# createPairingSession

[Chrome 등록](../features/browser-pairing.md) · [유틸 목록](../../UTILITIES.md)

확장의 승인 요청을 관리하는 비동기 함수를 반환합니다. 팝업을 닫아도 세션에 남은 코드로 승인 상태를 확인합니다.

`createPairingSession()`은 매개변수가 없습니다. 반환한 함수의 매개변수는 다음과 같습니다.

| 매개변수 | 설명 |
| --- | --- |
| `origin: string` | 확장이 연결하는 서버 주소입니다. |
| `registration: StoredRegistration \| null` | 현재 등록입니다. |
| `account: string \| undefined` | 현재 등록의 계정 비교 값입니다. |
| `intent: "register" \| "invite" \| null` | 등록, 추가 또는 상태 확인입니다. |
| `identify?: IdentifyFlex` | 최초 등록 전에 Flex 계정을 확인하는 함수입니다. |

| TC | 조건 | 기대 결과 |
| --- | --- | --- |
| TC-U-CREATE-PAIRING-SESSION-01 | 추가 요청을 승인합니다. | 코드를 숨기고 현재 등록과 계정 비교 값을 유지합니다. |
| TC-U-CREATE-PAIRING-SESSION-02 | 승인 전 채널이 바뀌거나 코드가 만료됩니다. | 저장한 코드가 더 이상 표시되지 않습니다. |
| TC-U-CREATE-PAIRING-SESSION-03 | 추가 코드 발급을 완료하지 못합니다. | 연결 상태는 유지하고 팝업에 발급 실패를 표시합니다. |
