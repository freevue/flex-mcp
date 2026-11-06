# flex MCP

로컬 MCP 서버입니다. MCP 클라이언트와 표준 입출력(`stdio`)으로 연결합니다. 현재 서버는 도구 목록과 입력 검사를 제공합니다. 호출하면 `조회 연결이 구성되지 않았습니다.` 오류를 반환합니다.

| 도구 | 연결 후 조회할 내용 | 기본 기간 |
| --- | --- | --- |
| `flex_get_annual_leave` | 현재 연차 잔여량과 사용 가능량. 각각 일수, 총 분, 일·시간·분으로 반환합니다. | 조회 시점 |
| `flex_get_schedule` | 본인 기본 캘린더의 일정 제목, 유형, 상태, 시작·종료 시간입니다. 종일 일정의 종료 날짜는 포함하지 않습니다. | 오늘부터 7일 |
| `flex_get_work_hours` | flex가 집계한 실제·인정·소정·연장 근무 및 휴가 시간입니다. 단위는 분입니다. | 이번 달 1일부터 오늘까지 |

일정과 근무 시간은 `{"from":"2026-11-01","to":"2026-11-05"}`처럼 기간을 지정할 수 있습니다. 두 날짜를 모두 포함하며, 한 번에 최대 31일을 조회합니다. 날짜는 한국 시간(`Asia/Seoul`) 기준입니다. 일정은 본인 기본 캘린더에 있는 항목만 조회합니다.

## 연결하기

Node.js 24와 루트 `package.json`에 지정한 pnpm 버전이 필요합니다. 모노레포 루트에서 `pnpm install --frozen-lockfile`을 실행합니다. `pnpm build:mcp`로 서버를 빌드합니다.

Codex에서 사용하려면 모노레포 루트에서 아래 명령을 실행합니다. 데스크톱 앱이 열려 있으면 등록 후 다시 시작합니다. [OpenAI 공식 MCP 설정 문서](https://learn.chatgpt.com/docs/extend/mcp#connect-codex-to-an-mcp-server)

```sh
codex mcp add flex -- "$(command -v node)" "$PWD/apps/mcp-server/dist/index.js"
```

다른 MCP 클라이언트에서는 아래처럼 로컬 `stdio` 서버를 설정합니다. `command -v node`로 Node.js의 절대 경로를 확인합니다.

```json
{
  "mcpServers": {
    "flex": {
      "command": "/절대경로/node",
      "args": ["/절대경로/flex/apps/mcp-server/dist/index.js"]
    }
  }
}
```

기존 `src/index.ts` 경로로 등록한 MCP 클라이언트도 서버를 실행할 수 있습니다. 루트에서 `pnpm check`로 타입을 검사합니다. `pnpm test`로 날짜 범위와 미연결 상태를 검사합니다.

## 공유 서버 연결

[직접 검증 절차](../../docs/features/shared-connection-check.md)에서 사용자별 키 발급과 Chrome 등록을 확인하세요. `pnpm flex:remote`는 합성 검증 서버를 시작합니다. 실제 flex 결과는 반환하지 않습니다.

패키지로 실행할 때는 `node dist/apps/mcp-server/src/remote/start.js`를 사용하세요. 키를 발급할 때는 `node dist/apps/mcp-server/src/registration/admin.js`를 사용하세요. 두 명령은 같은 `FLEX_STATE_FILE`을 읽습니다.
