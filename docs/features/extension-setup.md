# Chrome 확장 연결과 복구 안내

[투두 9](https://github.com/freevue/flex-mcp/issues/9) · [서비스 정책](../../SERVICE_POLICY.md) · [접근 권한](access-control.md)

사용자는 연결할 Chrome 프로필에서 확장 옵션을 엽니다. [등록 코드](browser-pairing.md)와 서버 주소를 입력합니다. 확장은 현재 상태와 사용자가 할 일을 보여줍니다. 조회 결과와 접근 정보는 화면이나 진단 로그에 표시하지 않습니다. 승인된 조회에 필요한 사이트와 동작에만 권한을 요청합니다.

| 상태 | 사용자가 할 일 |
| --- | --- |
| 연결되지 않음 | 사용할 Chrome 프로필에서 확장을 연결합니다. |
| 서버 연결됨 · flex 상태 미확인 | 필요한 경우 flex 탭을 열어 현재 계정을 확인합니다. |
| 조회 준비됨 | 에이전트에서 새 조회를 요청합니다. |
| 브라우저 오프라인 | Chrome을 실행합니다. 서버 연결을 확인합니다. |
| flex 탭 없음 | 연결한 프로필에서 flex를 엽니다. |
| 재로그인 필요 | 같은 프로필의 flex 화면에서 직접 로그인합니다. |
| 계정 불일치 | 연결한 계정으로 전환합니다. 다른 계정을 쓰려면 연결을 해제합니다. |
| 조회 실패 | flex 탭에서 필요한 정보가 보이는지 확인합니다. |

## 동작과 확인

확장 옵션은 등록 ID와 연결 상태를 표시합니다. [직접 검증 절차](shared-connection-check.md)에서 Chrome 재시작과 재접속을 확인합니다.

[연결 확인](../utilities/confirm-browser-binding.md)이 선택한 계정을 기록합니다. [확장 연결](../utilities/connect-bridge.md)이 서버 연결을 복구합니다. [상태 판정](../utilities/derive-connection-state.md)이 현재 상태를 안내로 바꿉니다. 연결을 해제하면 [접근 해제](../utilities/revoke-access.md)가 이후 조회를 차단합니다.

처음 설치한 Chrome에서 연결과 해제를 확인합니다. Chrome을 다시 시작한 뒤 서버 연결을 확인합니다. 이전 요청은 다시 실행하지 않습니다. 브라우저가 닫히면 조회할 수 없다는 점을 설치 안내에 씁니다. [Chrome의 확장 연결 문서](https://developer.chrome.com/docs/extensions/how-to/web-platform/websockets)를 참고합니다.

## 테스트 케이스

연결한 테스트는 로컬에서 확인했습니다. Chrome이나 원격 환경이 필요한 항목은 예정입니다.

| TC | 확인 범위 | 준비와 실행 | 기대 결과 |
| --- | --- | --- | --- |
| TC-F-EXTENSION-SETUP-01 | Chrome | 처음 설치한 Chrome 프로필에서 연결을 확인한 뒤 연결을 해제합니다. | 확인한 프로필만 연결합니다. 해제한 뒤 새 조회를 받지 않습니다. |
| TC-F-EXTENSION-SETUP-02 | 합성 연결 · [로컬 테스트](../../apps/chrome-extension/test/bridge.test.ts) | 서버 연결만 확인한 경우, flex 탭 없음, 재로그인 필요, 계정 불일치를 각각 전달합니다. | 상태와 다음 행동을 각각 표시합니다. 확인하지 않은 상태는 조회 준비로 표시하지 않습니다. |
| TC-F-EXTENSION-SETUP-03 | Chrome | 조회 대기 중 Chrome을 종료한 뒤 같은 프로필에서 다시 시작합니다. | 연결을 복구합니다. 이전 조회는 재실행하지 않습니다. |
| TC-F-EXTENSION-SETUP-04 | Chrome | 다른 웹사이트를 열고 확장 권한과 진단 화면을 확인합니다. | 허용하지 않은 사이트에서 조회하지 않습니다. 진단에 결과나 접근 정보를 표시하지 않습니다. |
