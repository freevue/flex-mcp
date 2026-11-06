# 설치한 Chrome에서 공유 연결 확인

[연결 흐름](shared-connection-flow.md) · [Chrome 등록](browser-pairing.md) · [투두 12](https://github.com/freevue/flex-mcp/issues/12)

이 절차는 합성 연차, 일정, 근무 시간을 사용합니다. 실제 flex 로그인이 필요 없습니다. 에이전트 키와 등록 코드는 발급받은 사용자에게만 전달하세요.

## 준비

Node.js 24와 Chrome 120 이상을 사용하세요. 아래 절차는 macOS와 Linux의 셸 명령을 사용합니다.

1. 저장소 루트에서 `pnpm install --frozen-lockfile`과 `pnpm build:extension`을 실행하세요.
2. 서로 다른 Chrome 프로필 두 개에서 `apps/chrome-extension/dist`를 압축 해제된 확장으로 로드하세요.
3. `chrome://extensions`에서 두 확장의 ID를 확인하세요. ID가 같으면 한 번만 적으세요.
4. 아래 명령을 실행할 셸에서 환경 변수를 설정하세요. 아래의 두 ID 표기를 실제 확장 ID로 바꾸세요.

```sh
mkdir -p .local
export FLEX_STATE_FILE="$PWD/.local/shared-demo.sqlite"
export FLEX_PUBLIC_URL="http://127.0.0.1:8787"
export FLEX_EXTENSION_IDS="extension-id-a,extension-id-b"
```

HTTPS를 사용할 때는 `FLEX_PUBLIC_URL`에 프록시 주소를 넣으세요. 프록시는 `127.0.0.1:8787`에 HTTP와 WebSocket을 전달합니다. 같은 Mac에서 확인할 때만 위의 HTTP 주소를 사용하세요. 다른 포트를 사용하면 `FLEX_PORT`와 주소를 함께 바꾸세요.

## 등록과 조회

운영자는 같은 환경 변수로 아래 명령을 실행합니다. `sample-alpha`와 `sample-beta`는 서로 다른 합성 사용자 ID입니다. `agent` 명령이 표시한 키는 각 사용자 에이전트의 인증 설정에만 넣으세요.

```sh
pnpm flex:admin agent sample-alpha
pnpm flex:admin agent sample-beta
pnpm flex:admin pair sample-alpha
pnpm flex:admin pair sample-beta
pnpm flex:remote
```

각 Chrome의 확장 옵션을 여세요. 서버 주소와 그 프로필의 등록 코드를 입력하세요. 두 프로필에 서로 다른 등록 ID와 연결 상태가 표시되는지 확인하세요.

각 에이전트에서 같은 `/mcp` 주소를 설정하세요. 사용자별 `Authorization: Bearer <key>` 헤더를 넣으세요. 헤더를 설정할 수 없는 클라이언트에는 이 검증 설정을 사용할 수 없습니다. 직접 호출하려면 아래처럼 해당 키를 환경 변수로 전달하세요.

```sh
pnpm --filter @flex-mcp/server run demo:query
```

이 명령은 `FLEX_PUBLIC_URL`과 `FLEX_AGENT_KEY`를 읽고 `flex_get_schedule`을 호출합니다. 응답의 합성 일정 제목에 등록 ID 앞부분이 표시됩니다. 조회 명령은 키를 출력하지 않습니다.

## 결과 기록

| TC | 실행 | 기대 결과 |
| --- | --- | --- |
| TC-F-SHARED-01 | 두 키로 같은 서버에 일정 조회를 보냅니다. | 각 응답은 해당 Chrome의 등록 ID 앞부분만 표시합니다. 결과에 `synthetic: true`가 있습니다. |
| TC-F-SHARED-02 | 첫 Chrome 프로필의 확장만 끕니다. 두 키로 각각 조회합니다. | 첫 요청은 `BROWSER_OFFLINE`입니다. 둘째 요청은 성공합니다. |
| TC-F-SHARED-03 | 첫 프로필의 확장을 다시 켜고 옵션을 엽니다. | 이전과 같은 등록 ID를 표시합니다. 이후 조회만 처리합니다. |
| TC-F-SHARED-04 | 첫 확장의 연결을 해제합니다. | 첫 키로 조회할 수 없습니다. 둘째 연결은 유지됩니다. |
| TC-F-SHARED-05 | 잘못된 키 또는 두 번째 사용한 등록 코드로 요청합니다. | 서버가 요청을 거부합니다. |

투두 12에 통과, 실패, 미실행을 구분해 적으세요. 등록 코드, 확장 키, 에이전트 키는 붙이지 마세요. 실제 flex 조회와 운영 배포 결과는 따로 기록하세요.
