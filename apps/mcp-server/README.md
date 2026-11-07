# flex MCP 서버

[개발 문서](../../docs/mcp/README.md) · [함수별 계약](../../docs/mcp/functions.md) · [개발 명령](../../docs/mcp/development.md) · [Cloudflare Workers 설계](../../docs/mcp/cloudflare-workers.md)

공개 서버에는 Node 검증용 실행 파일과 Workers 진입점이 있습니다. `stdio`는 도구 입력을 검사하는 로컬 실행 방식입니다. 원격 Node 서버는 합성 데이터로 등록과 조회를 검증합니다. Cloudflare Workers는 운영 배포 대상입니다. 원격 서버는 사전 등록 없이 MCP 초기화와 도구 목록을 제공합니다. 실제 조회는 [개인 Chrome 설치본](../../docs/features/extension-setup.md)에서 실행합니다.

## 도구

| 도구 | 입력과 동작 |
| --- | --- |
| [`flex_get_annual_leave`](../../docs/mcp/tools/flex-get-annual-leave.md) | 연결 키에 해당하는 채널의 연차 잔여량과 사용 가능량을 읽습니다. |
| [`flex_get_schedule`](../../docs/mcp/tools/flex-get-schedule.md) | 날짜 두 개를 선택할 수 있습니다. 기본값은 한국 시간 오늘부터 7일입니다. |
| [`flex_get_work_hours`](../../docs/mcp/tools/flex-get-work-hours.md) | 날짜 두 개를 선택할 수 있습니다. 기본값은 이번 달 1일부터 오늘까지입니다. |
| [`flex_get_socket_status`](../../docs/mcp/tools/flex-get-socket-status.md) | 연결 키에 해당하는 Chrome 등록과 소켓만 확인합니다. |
| [`flex_approve_connection`](../../docs/mcp/tools/flex-approve-connection.md) | 팝업의 `approvalCode`를 받아 연결 키를 반환합니다. |
| [`flex_get_work_summary`](../../docs/mcp/tools/flex-get-work-summary.md) | 인자 없이 이번 달 근무와 놀수 반영 전후의 남은 시간을 읽습니다. 현재는 본인 PC MCP에만 있습니다. |

원격 조회와 소켓 상태 도구에는 승인에서 받은 `connectionKey`를 넣습니다. 기간을 직접 지정할 때는 `from`과 `to`를 함께 보냅니다. 두 날짜를 포함해 최대 31일입니다. 날짜는 한국 시간(`Asia/Seoul`)입니다. 각 도구의 문서에서 필드, 오류와 테스트 케이스를 확인합니다.

## 로컬 실행과 검사

Node.js 24와 루트 `package.json`에 지정한 pnpm 버전을 사용합니다. 모노레포 루트에서 의존성을 설치하고 빌드합니다.

```sh
pnpm install --frozen-lockfile
pnpm build:mcp
pnpm check
pnpm test
```

공개 `stdio` 서버는 도구 목록과 입력 검사를 제공합니다. 유효한 호출에도 `조회 연결이 구성되지 않았습니다.` 오류를 반환합니다. Codex에서 이 공개 검사 서버를 연결하려면 모노레포 루트에서 아래 명령을 실행합니다.

```sh
codex mcp add flex -- "$(command -v node)" "$PWD/apps/mcp-server/dist/index.js"
```

다른 클라이언트에서는 Node.js의 절대 경로를 명령으로 지정합니다. 첫 인자에 `apps/mcp-server/dist/index.js`의 절대 경로를 넣습니다. 소스에서 확인할 때는 `apps/mcp-server/src/index.ts`도 사용할 수 있습니다. 본인 PC의 실조회 MCP는 별도 로컬 실행 파일입니다. 공개 패키지에는 넣지 않습니다.

## 원격 연결과 배포

Node 합성 검증에서는 `pnpm flex:remote`를 실행합니다. [두 Chrome 프로필 검증](../../docs/features/shared-connection-check.md)에서 팝업 코드 승인, 조회와 연결 해제를 확인합니다. 합성 모드의 결과에는 `synthetic: true`가 있습니다.

Node 패키지의 원격 서버는 `node dist/apps/mcp-server/src/remote/start.js`로 실행합니다. `FLEX_STATE_FILE`에 로컬 상태 파일을 지정합니다.

Workers 운영 MCP 주소는 `https://flex-mcp.freevue.dev/mcp`입니다. 새 에이전트를 연결하려면 [등록·승인 요청문](../../docs/screens/agent-approval.md#복사해서-보낼-요청문)을 복사하세요. Workers를 운영할 때는 [배포 설계](../../docs/mcp/cloudflare-workers.md)와 [배포 절차](../../docs/mcp/workers-release.md)를 따릅니다.
