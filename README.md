<p align="center">
  <img src="./apps/chrome-extension/icons/icon-128.png" width="96" height="96" alt="갈피의 보라색 F 책갈피 로고">
</p>

<h1 align="center">갈피</h1>

<p align="center">Flex의 연차, 일정, 근무 시간을 Chrome과 MCP에서 확인합니다.</p>

<p align="center">갈피 · MCP 소스 버전: 0.8.5</p>

<p align="center">
  <a href="https://github.com/freevue/flex-mcp/releases/download/0.7.0/galpi.0.7.0.zip"><strong>갈피 0.7.0 ZIP 다운로드</strong></a>
  · <a href="https://github.com/freevue/flex-mcp/releases/tag/0.7.0">0.7.0 릴리스</a>
  · <a href="https://github.com/freevue/flex-mcp/releases/latest">최신 공개 릴리스</a>
</p>

공개 ZIP은 예시 데이터로 설치와 연결을 확인하는 팀 검증용입니다. 실제 Flex 기록을 조회하려면 [개인 설치본 안내](docs/features/extension-setup.md#개인-설치본에서-실제-flex-조회)를 따르세요.

## 1. Chrome에 설치하기

Chrome 120 이상이 필요합니다.

1. 공개 릴리스에서 ZIP을 내려받고 압축을 푸세요. 파일 이름은 `galpi.<버전>.zip`입니다.
2. Chrome 주소창에서 `chrome://extensions`를 여세요.
3. 오른쪽 위의 `개발자 모드`를 켜세요.
4. `압축해제된 확장 프로그램을 로드합니다`를 누르세요.
5. 압축을 푼 폴더 중 `manifest.json`이 있는 폴더를 선택하세요.

Chrome 툴바의 확장 프로그램 메뉴에서 갈피를 고정하면 팝업을 바로 열 수 있습니다. 기존 설치를 업데이트한다면, 같은 폴더에 새 파일을 넣은 뒤 `chrome://extensions`에서 갈피를 새로고침하세요.

## 2. MCP에 연결하기

에이전트의 MCP 설정에 다음 주소를 등록하세요. 전송 방식은 `Streamable HTTP`입니다. [등록과 승인을 한 번에 요청하는 문장](docs/screens/agent-approval.md#복사해서-보낼-요청문)을 복사해서 써도 됩니다.

```text
https://flex-mcp.freevue.dev/mcp
```

1. 개인 설치본을 쓴다면, 갈피를 설치한 Chrome 프로필에서 Flex에 로그인하고 탭을 열어 두세요.
2. 갈피 팝업을 열고 일회용 코드를 복사하세요.
3. 에이전트에 코드를 보내고 `flex_approve_connection`으로 승인해 달라고 요청하세요.
4. 에이전트에 `flex_get_socket_status`로 연결을 확인해 달라고 요청하세요.

코드는 발급 후 5분 안에 한 번만 쓸 수 있습니다. 에이전트는 승인에서 받은 `connectionKey`로 조회합니다. 키를 대화에 표시하거나 공유하지 마세요. Flex 로그인 정보는 Chrome에 남습니다.

다른 에이전트를 연결하려면 팝업 오른쪽 위의 `코드 확인`을 누르세요. 새 코드로 같은 승인 절차를 진행하면 기존 연결도 유지됩니다.

## 3. 근무·연차·일정 조회하기

MCP와 Flex가 연결되면 갈피 팝업에서 오늘 실제 근무, 이번 달 인정 근무, 이번 달 남은 시간을 볼 수 있습니다. 인정 근무의 `연차 포함`은 예정 연차 중 근무로 인정될 시간까지 더합니다. 남은 시간은 이 연차를 포함해 계산하며, 놀수(지정된 수요일 휴무) 반영 전후를 나란히 표시합니다. [근무 요약 계산 기준](docs/features/extension-work-summary.md)을 참고하세요.

세부 내역은 연결한 에이전트에 요청하세요.

| 이렇게 물어보세요                                                    | MCP 도구                                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 남은 연차를 알려줘.                                                  | [`flex_get_annual_leave`](docs/mcp/tools/flex-get-annual-leave.md) |
| 앞으로 7일 일정을 보여줘.                                            | [`flex_get_schedule`](docs/mcp/tools/flex-get-schedule.md)         |
| 이번 달 날짜별 근무 시간을 보여줘.                                   | [`flex_get_work_hours`](docs/mcp/tools/flex-get-work-hours.md)     |
| 오늘 근무, 이번 달 누적, 연차 인정분과 놀수 전후 남은 시간을 보여줘. | [`flex_get_work_summary`](docs/mcp/tools/flex-get-work-summary.md) |

## 연결이 끊기면

실제 Flex를 조회하는 동안에는 로그인한 Chrome 탭을 열어 두세요. MCP가 끊기면 팝업에서 `다시 연결`을 누르세요. Flex가 끊기면 등록한 계정의 Flex 탭을 열고 `다시 확인`을 누르세요. 상태별 조치는 [설치·연결·복구 안내](docs/features/extension-setup.md#연결-상태)를 참고하세요.

## 개발과 배포

Node.js 24와 [package.json](package.json)에 지정한 pnpm 버전을 사용하세요. 저장소 루트에서 `pnpm install --frozen-lockfile`을 실행하세요.

| 작업               | 명령 또는 문서                                               |
| ------------------ | ------------------------------------------------------------ |
| Chrome 확장 빌드   | `pnpm build:extension` → `apps/chrome-extension/dist/`       |
| MCP 서버 빌드      | `pnpm build:mcp` → `apps/mcp-server/dist/`                   |
| 타입 검사와 테스트 | `pnpm check`, `pnpm test`, `pnpm test:e2e`                   |
| 확장 ZIP 릴리스    | [Git 훅과 Chrome 확장 릴리스](docs/features/ci-artifacts.md) |
| 운영 MCP 배포      | [Cloudflare Workers 배포 절차](docs/mcp/workers-release.md)  |

[서버 실행 안내](apps/mcp-server/README.md)에서 로컬 MCP 실행 방법을 확인하세요. [LLM Wiki](LLM_WIKI.md)에서 아키텍처, 서비스 정책, MCP 도구 문서를 찾을 수 있습니다. 진행 중인 작업은 [GitHub 투두](https://github.com/freevue/flex-mcp/issues?q=is%3Aissue+label%3Atodo)에서 확인하세요.
