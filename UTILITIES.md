# flex MCP 유틸 계약

[LLM Wiki](LLM_WIKI.md) · [아키텍처](ARCHITECTURE.md) · [도구 입력](apps/mcp-server/README.md) · [개발 규칙](.agent/rules/GEMINI.md) · [작업 목록](WORKFLOW.md)

유틸은 한 가지 일을 맡는 함수입니다. 아래 표의 파일명은 구현할 위치입니다. `dates.ts`의 함수와 로컬 도구 등록만 현재 동작합니다.

## Chrome 확장

조회 함수는 `apps/chrome-extension/src/flex/`에 둡니다. 각 파일은 표에 있는 주 함수를 이름으로 내보냅니다. 작은 내부 함수는 사용하는 파일에 둡니다.

| 파일과 함수 | 입력 | 출력과 책임 |
| --- | --- | --- |
| `readFlexJson.ts` · `readFlexJson` | 확장 코드에 정의된 조회 요청 | flex 탭에서 읽기 요청을 실행합니다. 응답이 JSON 객체인지 확인합니다. 임의 주소는 받지 않습니다. |
| `readCurrentUser.ts` · `readCurrentUser` | 현재 flex 탭 | 현재 사용자 식별자를 반환합니다. 식별자는 확장 안에서만 사용합니다. |
| `parseAnnualLeave.ts` · `parseAnnualLeave` | flex 응답과 조회 시각 | 연차 잔여량과 사용 가능량을 구분합니다. `0`과 잔액 정보 없음도 구분합니다. 네트워크 요청은 하지 않습니다. |
| `readAnnualLeave.ts` · `readAnnualLeave` | 탭에서 확인한 현재 사용자 | `asOf`, `remaining`, `usable`을 반환합니다. 각 잔액은 일수, 총 분, 일·시간·분을 포함합니다. |
| `readSchedule.ts` · `readSchedule` | 현재 사용자, 조회 기간 | 본인 기본 캘린더의 일정을 반환합니다. 중복을 제거합니다. 제목, 유형, 상태, 종일 여부, 시작과 제외할 종료 시점을 보냅니다. |
| `readWorkHours.ts` · `readWorkHours` | 현재 사용자, 조회 기간 | 실제·인정·소정·연장근무와 휴가 시간을 분으로 반환합니다. |
| `runFlexQuery.ts` · `runFlexQuery` | 검사한 읽기 요청, 확장에 연결한 사용자 | 탭의 현재 사용자가 연결한 사용자와 같으면 조회 함수 하나를 호출합니다. 결과에서 내부 식별자를 제외합니다. |

연결 함수는 `apps/chrome-extension/src/bridge/`에 둡니다. 확장 서비스 워커는 연결을 시작합니다. flex 탭에서는 조회 함수만 실행합니다.

| 파일과 함수 | 입력 | 출력과 책임 |
| --- | --- | --- |
| `connectBridge.ts` · `connectBridge` | 브리지 연결 설정 | 브리지에 연결합니다. 브리지는 서버와 확장 사이의 통로입니다. 연결이 끊기면 다시 연결합니다. 끝난 요청을 다시 실행하지 않습니다. |
| `findFlexTab.ts` · `findFlexTab` | 현재 Chrome 프로필의 탭 목록 | flex 탭 하나를 선택합니다. flex 탭이 없으면 `FLEX_TAB_UNAVAILABLE`을 반환합니다. |
| `dispatchToFlexTab.ts` · `dispatchToFlexTab` | 확인한 탭과 읽기 요청 | 확장에 포함된 조회 코드를 실행합니다. 탭이 바뀌거나 닫히면 이전 탭의 결과를 반환하지 않습니다. |

## MCP 서버와 메시지

서버 연결 함수는 `apps/mcp-server/src/bridge/`에 둡니다. [날짜 유틸](apps/mcp-server/src/dates.ts)의 `seoulDate`, `shiftDate`, `resolveRange`를 재사용합니다. 서버에서 한국 시간 기준 기간을 먼저 정합니다. 기간이 필요한 조회는 확장에서도 두 날짜와 31일 제한을 확인합니다.

| 파일과 함수 | 입력 | 출력과 책임 |
| --- | --- | --- |
| `attachBrowserBridge.ts` · `attachBrowserBridge` | 허용된 브라우저 연결 | 연결을 해당 프로필에 등록합니다. 기존 연결을 교체할 때 그 연결에서 기다리던 요청을 종료합니다. |
| `forwardFlexQuery.ts` · `forwardFlexQuery` | 허용된 호출자와 검사한 읽기 요청 | 요청 ID를 만들고 등록된 확장에 전달합니다. 같은 연결에서 돌아온 해당 ID의 결과만 반환합니다. |

메시지 검사 함수는 입력을 받는 쪽에서 사용합니다. `parseBridgeRequest.ts`는 확장의 `src/bridge/`에 둡니다. `parseBridgeReply.ts`는 서버의 `src/bridge/`에 둡니다.

| 파일과 함수 | 입력 | 출력과 책임 |
| --- | --- | --- |
| `parseBridgeRequest.ts` · `parseBridgeRequest` | 확장이 받은 값 | 요청 ID, 도구 종류, 기간을 확인합니다. 알 수 없는 필드나 허용하지 않은 도구가 있으면 거부합니다. |
| `parseBridgeReply.ts` · `parseBridgeReply` | 서버가 받은 값과 대기 중인 도구 종류 | 요청 ID, 성공 결과 또는 오류 코드를 확인합니다. 도구에 없는 결과 필드는 거부합니다. |

요청 ID는 서버가 한 번의 조회에 붙이는 값입니다. 성공 응답에는 요청 ID와 도구 결과만 담습니다. 실패 응답에는 요청 ID와 오류 코드만 담습니다. 오류 문구는 서버에서 정합니다. 요청에 사번, URL, 실행 코드가 들어오면 거부합니다.

```json
{"requestId":"example-request","query":{"kind":"leave"}}
```

`kind`는 `leave`, `schedule`, `work` 중 하나입니다. `leave`에는 기간이 없습니다. `schedule`과 `work`에는 `range` 아래에 `from`과 `to`를 넣습니다. 두 날짜를 조회 기간에 포함합니다.

| 상태 | 반환하는 경우 |
| --- | --- |
| `BROWSER_OFFLINE` | 확장이 연결되지 않았거나 결과가 오기 전에 끊겼습니다. |
| `FLEX_TAB_UNAVAILABLE` | 현재 프로필에 조회할 flex 탭이 없습니다. |
| `FLEX_REAUTH_REQUIRED` | flex가 로그인 화면을 요구하거나 현재 사용자를 확인할 수 없습니다. |
| `FLEX_ACCOUNT_MISMATCH` | 연결한 사용자와 탭의 현재 사용자가 다릅니다. |
| `FLEX_READ_FAILED` | flex 조회가 실패했거나 예상한 결과를 받지 못했습니다. |
| `QUERY_TIMEOUT` | 연결은 유지됐지만 정한 시간 안에 결과가 오지 않았습니다. |
| `INVALID_BRIDGE_MESSAGE` | 요청이나 응답이 정해진 형태를 벗어났습니다. |

## 구현과 확인 순서

연차 한 건부터 연결합니다. 합성 데이터로 잔액 `0`, 정보 없음, 예상과 다른 응답을 확인합니다. Chrome에서 실제 조회, 브라우저 오프라인, 로그인 만료를 각각 확인합니다. 같은 사용자로 확인한 뒤 일정과 근무 시간을 연결합니다.

두 앱에서 같은 메시지 계약을 쓰는 시점에 공통 코드를 한 곳에 둡니다. 각 배포 산출물에는 필요한 코드가 들어갑니다. 확장은 배포 후 서버에서 실행 코드를 가져오지 않습니다.
