# 설치한 Chrome에서 공유 연결 확인

[연결 흐름](shared-connection-flow.md) · [Chrome 등록](browser-pairing.md) · [투두 17](https://github.com/freevue/flex-mcp/issues/17)

이 절차는 합성 데이터로 등록과 조회를 확인합니다. 실제 Flex 로그인은 필요 없습니다.

## 준비

저장소 루트에서 다음 명령을 실행합니다. 같은 PC에서 Node 합성 서버와 확장을 실행합니다.

```sh
pnpm install --frozen-lockfile
export FLEX_PUBLIC_URL="http://127.0.0.1:8787"
export FLEX_STATE_FILE="$PWD/.local/shared-demo.sqlite"
mkdir -p .local
FLEX_EXTENSION_SERVER_URL="$FLEX_PUBLIC_URL" FLEX_EXTENSION_DEMO=1 pnpm build:extension
pnpm flex:remote
```

Chrome 프로필 두 개에서 각각 `apps/chrome-extension/dist`를 압축 해제된 확장으로 로드합니다. 운영 주소를 확인할 때는 [Workers 배포 절차](../mcp/workers-release.md)를 따릅니다.

## 등록과 조회

1. MCP 클라이언트를 서버 주소의 `/mcp`에 연결합니다.
2. 첫 Chrome 팝업에서 코드를 발급합니다.
3. 해당 MCP 클라이언트에서 코드로 `flex_approve_connection`을 호출합니다.
4. 팝업에서 소켓이 연결될 때까지 기다립니다.
5. 승인 결과의 `connectionKey`를 조회 도구의 인자로 보냅니다.
6. 둘째 프로필도 새 코드로 같은 절차를 실행합니다.

별도 클라이언트 목록과 확장 ID 목록은 설정하지 않습니다. 연결 키는 MCP 조회에만 사용합니다. 키를 다른 사용자에게 보내거나 진단 로그에 넣지 않습니다.

| TC | 실행 | 기대 결과 |
| --- | --- | --- |
| TC-F-SHARED-01 | 두 연결 키로 동시에 일정을 조회합니다. | 각 결과는 해당 Chrome에서만 나옵니다. |
| TC-F-SHARED-02 | 첫 확장의 연결만 끊습니다. | 첫 채널은 오프라인입니다. 둘째 채널은 유지됩니다. |
| TC-F-SHARED-03 | 첫 확장을 다시 켭니다. | 같은 등록과 연결 키로 조회할 수 있습니다. |
| TC-F-SHARED-04 | 한 등록을 해제합니다. | 그 등록의 키만 무효입니다. |
| TC-F-SHARED-05 | 같은 승인 코드를 다시 제출합니다. | 새 연결 키를 받지 못합니다. |
