# 설치한 Chrome에서 공유 연결 확인

[연결 흐름](shared-connection-flow.md) · [Chrome 등록](browser-pairing.md) · [투두 12](https://github.com/freevue/flex-mcp/issues/12)

이 절차는 합성 연차, 일정과 근무 시간을 사용합니다. 실제 Flex 로그인은 필요 없습니다. 합성 자료는 실제 계정의 결과가 아닙니다.

## 준비

Node.js 24와 Chrome 120 이상을 사용합니다. 저장소 루트에서 다음 명령을 실행합니다.

```sh
pnpm install --frozen-lockfile
export FLEX_PUBLIC_URL="http://127.0.0.1:8787"
FLEX_EXTENSION_SERVER_URL="$FLEX_PUBLIC_URL" FLEX_EXTENSION_DEMO=1 pnpm build:extension
```

서로 다른 Chrome 프로필 두 개에서 `apps/chrome-extension/dist`를 압축 해제된 확장으로 로드합니다. 각 프로필에서 `chrome://extensions`를 열고 확장 ID를 확인합니다. 아래 명령의 ID를 실제 확장 ID로 바꿉니다. 두 ID가 같으면 한 번만 씁니다.

```sh
mkdir -p .local
export FLEX_STATE_FILE="$PWD/.local/shared-demo.sqlite"
export FLEX_EXTENSION_IDS="extension-id-a,extension-id-b"
pnpm flex:admin agent-approve sample-alpha
pnpm flex:admin agent-approve sample-beta
pnpm flex:remote
```

HTTP 주소는 같은 컴퓨터에서만 사용합니다. 다른 컴퓨터에서 확인하려면 HTTPS 공개 주소를 사용합니다. 프록시는 Node 서버에 HTTP와 WebSocket을 전달해야 합니다. 빌드 주소와 `FLEX_PUBLIC_URL`은 같아야 합니다.

## 등록과 조회

각 에이전트에 같은 `/mcp` 주소와 해당 사용자 키의 `Authorization: Bearer <key>` 헤더를 설정합니다. 운영자가 출력한 키를 다른 사용자와 공유하지 않습니다. 일반 `agent` 명령이 발급한 키는 조회만 할 수 있습니다.

첫 프로필의 확장 팝업에서 코드를 발급합니다. 첫 에이전트에 그 코드로 자신의 Chrome 연결을 승인해 달라고 요청합니다. 에이전트는 `flex_approve_connection`을 호출합니다. 승인되면 팝업은 자동으로 연결 상태와 합성 근무 요약을 표시합니다. 둘째 프로필과 에이전트도 같은 순서로 연결합니다.

각 에이전트에서 인자 없이 `flex_get_socket_status`를 호출합니다. 두 호출이 각각 `online`을 반환해야 합니다. `flex_get_schedule`을 호출하면 합성 일정 제목에 각 등록 ID의 앞부분이 들어갑니다. 설치한 Chrome의 조회 결과에 `synthetic: true`가 있는지 확인합니다.

에이전트 없이 조회를 호출하려면 같은 서버 주소를 설정한 셸에서 다음 명령을 실행합니다. 프롬프트가 표시되면 사용자 키를 입력합니다. 명령은 키를 출력하지 않습니다.

```sh
printf '에이전트 키: '
IFS= read -rs FLEX_AGENT_KEY
printf '\n'
export FLEX_AGENT_KEY
pnpm --filter @flex-mcp/server run demo:query
unset FLEX_AGENT_KEY
```

## 결과 기록

| TC | 실행 | 기대 결과 |
| --- | --- | --- |
| TC-F-SHARED-01 | 두 에이전트로 같은 서버의 일정과 상태를 조회합니다. | 각 요청은 자신의 Chrome에만 전달됩니다. |
| TC-F-SHARED-02 | 첫 프로필의 확장만 끕니다. 두 에이전트에서 다시 조회합니다. | 첫 조회는 `BROWSER_OFFLINE`입니다. 둘째 조회는 성공합니다. |
| TC-F-SHARED-03 | 첫 프로필의 확장을 다시 켭니다. | 새 승인 없이 이전 등록으로 연결합니다. |
| TC-F-SHARED-04 | 같은 상태 파일에 `pnpm flex:admin revoke-browser sample-alpha`를 실행합니다. | 첫 확장만 연결을 잃습니다. 둘째 연결은 유지됩니다. |
| TC-F-SHARED-05 | 조회 전용 키로 승인을 요청하거나 같은 코드로 다시 승인합니다. | 서버가 요청을 거부합니다. |
| TC-F-SHARED-06 | 빌드할 때 `FLEX_EXTENSION_DEMO`를 빼고 팝업을 확인합니다. | MCP 상태와 Flex 미연결 상태가 보입니다. 근무 숫자는 숨깁니다. |

투두 12에 통과, 실패와 미실행을 구분해 적습니다. 승인 코드나 키를 붙이지 않습니다. 실제 Flex 조회와 운영 배포 결과는 따로 기록합니다.
