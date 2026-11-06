# Chrome 확장 연결과 복구

[투두 9](https://github.com/freevue/flex-mcp/issues/9) · [팝업](extension-ui-plan.md) · [두 프로필 검증](shared-connection-check.md)

서버 주소는 확장 빌드에서 정합니다. Chrome 툴바의 확장 아이콘을 누르면 팝업이 열립니다. 소켓이 연결되어 있으면 MCP와 Flex 상태를 확인할 수 있습니다.

## 로컬 합성 검증용 설치

저장소 루트에서 아래 명령을 실행합니다. 이 빌드는 같은 PC의 Node 합성 서버에 연결합니다.

```sh
FLEX_EXTENSION_SERVER_URL=http://127.0.0.1:8787 FLEX_EXTENSION_DEMO=1 pnpm package:public
```

`chrome://extensions`에서 개발자 모드를 켭니다. `압축해제된 확장 프로그램을 로드합니다`를 눌러 `apps/chrome-extension/dist`를 선택합니다. ZIP을 받았다면 먼저 압축을 풀고 `manifest.json`이 있는 폴더를 선택합니다.

[합성 서버를 실행](shared-connection-check.md)합니다. 서버가 실행되면 팝업의 코드를 승인할 수 있습니다. 이 빌드는 실제 Flex 조회나 [Workers 배포](../mcp/cloudflare-workers.md)를 검증하지 않습니다.

## Workers 합성 서버 연결용 빌드

Workers의 등록과 WebSocket 경로를 확인한 뒤, 저장소 루트에서 아래 명령을 실행합니다. 확장에는 `/mcp`가 없는 서버 주소를 넣습니다.

```sh
FLEX_EXTENSION_SERVER_URL=https://flex-mcp.freevue.dev FLEX_EXTENSION_DEMO=1 pnpm build:extension
```

이 명령은 운영 도메인에 연결할 합성 검증용 확장을 만듭니다.

## 개인 설치본에서 실제 Flex 조회

개인 설치본은 공개 확장과 다른 폴더에 둡니다. 로컬 조회 원본이 있는 PC에서는 저장소 루트에서 `node .local/flex-mcp/chrome/build.mjs`를 실행합니다. `apps/chrome-extension/dist-personal` 폴더를 Chrome의 개발자 모드에서 로드합니다. 이 폴더를 공개 저장소나 공개 배포에 올리지 않습니다.

1. 설치한 Chrome 프로필에서 `https://flex.team`을 열고 로그인합니다.
2. 개인 설치본 팝업에서 일회용 코드를 발급합니다. 확장이 이 탭의 계정을 등록합니다.
3. [운영 MCP](https://flex-mcp.freevue.dev/mcp)에서 코드를 `flex_approve_connection`에 보냅니다.
4. 연결 키로 `flex_get_socket_status`를 호출합니다. `online`이면 같은 키로 연차, 일정과 근무 시간 도구를 호출합니다.
5. 해당 결과를 Flex 화면과 대조합니다. 개인 설치본의 결과에는 `synthetic: true`가 붙지 않습니다.

Flex 탭이 여러 개면 확장은 가장 최근에 사용한 Flex 탭을 확인합니다. 조회 중에 해당 탭을 닫거나 등록한 계정과 다른 계정이 확인되면 조회를 차단합니다. 등록한 계정의 Flex 탭을 연 뒤 `다시 확인`을 누르세요. 기존 연결 키를 다시 쓸 수 있습니다. 로그인 정보와 계정 비교 값은 Chrome에 남습니다. 팝업의 [이번 달 근무 요약](extension-work-summary.md)에도 같은 규칙을 적용합니다.

같은 채널에 다른 에이전트를 연결하려면 상태 화면에서 `에이전트 추가`를 누르세요. 새 에이전트의 MCP 클라이언트에서 [코드를 승인](browser-pairing.md#연결된-확장에-에이전트-추가)하면 이전 연결은 유지됩니다.

## 연결 상태

| 팝업 상태 | 사용자가 할 일 |
| --- | --- |
| Chrome 연결 | `일회용 코드 발급`을 누릅니다. 기존 등록이 있으면 `다시 연결`을 누를 수 있습니다. |
| 승인 대기 | 코드를 복사해 MCP 클라이언트에 연결 승인을 요청합니다. |
| MCP 연결됨 · Flex 연결됨 | 개인 설치본에 오늘 근무, 월 누적 근무, 오늘 기준 남은 시간과 예정 연차 반영 예상치이 표시됩니다. |
| MCP 연결됨 · Flex 미연결 | 확장에 Flex 조회 연결이 없습니다. |
| MCP 연결됨 · Flex 합성 모드 | 이번 달 예시 근무 요약을 확인합니다. |
| 연결 확인 실패 | 다시 확인합니다. 서버에 닿지 않았다는 이유로 기존 등록을 지우지 않습니다. |

확장은 서버가 확장 키를 거부할 때만 해당 등록을 지웁니다. Chrome을 다시 시작하면 남은 등록으로 다시 연결합니다. 이전 조회는 다시 실행하지 않습니다. Chrome이 종료되면 에이전트는 Flex 조회를 실행할 수 없습니다.

등록 해제 조건은 [Chrome 등록 절차](browser-pairing.md)를 참고하세요. 실계정 확인과 실제 Flex 조회는 [실조회 범위](reading-boundary.md)에서 별도로 다룹니다.

| TC | 준비와 실행 | 기대 결과 |
| --- | --- | --- |
| TC-F-EXTENSION-SETUP-01 | 팝업의 코드를 MCP 클라이언트에서 승인한 뒤 등록을 해제합니다. | 해당 프로필만 연결을 잃습니다. 새 조회를 받지 않습니다. |
| TC-F-EXTENSION-SETUP-03 | 조회 대기 중 Chrome을 종료한 뒤 같은 프로필을 다시 시작합니다. | 연결을 복구합니다. 이전 조회를 재실행하지 않습니다. |
| TC-F-EXTENSION-SETUP-04 | 빌드한 패키지의 권한과 팝업 화면을 확인합니다. | 배포 서버만 접근 권한을 갖습니다. 팝업은 요청 키나 확장 키를 표시하지 않습니다. |
