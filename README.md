# flex MCP

flex의 본인 연차, 일정, 근무 시간을 조회하는 프로젝트입니다. Node.js 24, TypeScript, [pnpm 워크스페이스](https://pnpm.io/workspaces)로 두 앱을 한 저장소에서 관리합니다. [LLM Wiki](LLM_WIKI.md)는 프로젝트 지식을 찾는 진입점입니다.

| 앱 | 현재 상태 | 독립 빌드 |
| --- | --- | --- |
| [MCP 서버](apps/mcp-server/README.md) | 로컬 도구 계약과 공유 원격 연결을 제공합니다. 원격 연결은 합성 데이터를 반환합니다. | `pnpm build:mcp` → `apps/mcp-server/dist/` |
| [Chrome 확장](apps/chrome-extension/manifest.json) | 툴바 팝업에서 연결하고, 합성 모드를 켜면 근무 요약과 합성 조회를 제공합니다. 실제 flex 탭에는 연결하지 않습니다. | `pnpm build:extension` → `apps/chrome-extension/dist/` |

## 개발 환경

Node.js 24와 [package.json](package.json)에 지정한 pnpm 버전을 준비합니다. nvm을 사용하면 `nvm use`로 Node.js 24를 선택합니다. 다음 명령은 저장소 루트에서 실행합니다.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

`pnpm start`는 로컬 MCP를 소스에서 실행합니다. MCP 클라이언트 등록 방법은 [서버 사용 안내](apps/mcp-server/README.md)를 참고하세요.

[MCP 도구와 함수 계약](docs/mcp/README.md)에서 입력, 반환값과 테스트 케이스를 확인합니다. 운영 배포 대상은 Cloudflare Workers입니다. [배포 설계](docs/mcp/cloudflare-workers.md)에서 합성 검증 빌드와 실제 운영 전환을 구분합니다.

현재 빌드에서 두 사용자로 확인하려면 [직접 검증 절차](docs/features/shared-connection-check.md)를 따르세요. 합성 검증 서버는 로컬 표준 입출력 서버와 별도로 실행합니다. [확장이 시작하는 등록](docs/features/browser-pairing.md)은 에이전트가 MCP 도구로 승인합니다.

## 배포 산출물 준비

`pnpm package:public`은 서버 패키지와 확장 ZIP을 새 `.artifacts/public-*` 디렉터리에 만듭니다. 각 압축 파일의 경로와 필수 파일을 검사합니다. 이 명령에는 `tar`, `zip`, `unzip`이 필요합니다. [자동 검사 설정](.github/workflows/check.yml)도 같은 명령을 사용합니다.

- MCP 서버: 루트에서 `mkdir -p .artifacts`를 실행합니다. `pnpm --dir apps/mcp-server pack --pack-destination "$PWD/.artifacts"`로 서버 패키지를 만듭니다. 배포 환경에서 Node.js 24와 런타임 의존성을 설치합니다.
- Chrome 확장: `pnpm build:extension`을 실행합니다. `chrome://extensions`에서 개발자 모드를 켭니다. `apps/chrome-extension/dist/`를 압축을 푼 확장으로 로드합니다. ZIP이 필요하면 아래 명령을 실행합니다. [Chrome 확장 패키지 안내](https://developer.chrome.com/docs/extensions/reference/manifest)

```sh
mkdir -p .artifacts
pnpm build:extension
(cd apps/chrome-extension/dist && zip -qDryFS ../../../.artifacts/flex-chrome-extension.zip .)
```

두 앱은 따로 빌드할 수 있습니다. 원격 연결 구조는 [아키텍처](ARCHITECTURE.md)에서 봅니다. 운영 범위와 실제 조회 조건은 [서비스 정책](SERVICE_POLICY.md)에서 봅니다. [기능 목록](docs/features/README.md)은 투두와 함수 문서를 연결합니다.

작업 목록은 [GitHub 투두](https://github.com/freevue/flex-mcp/issues?q=is%3Aissue+label%3Atodo)에서 봅니다. 작업 절차는 [투두 운영](WORKFLOW.md)에 있습니다. 코드 변경 전에는 [로컬 개발 규칙](.agent/rules/GEMINI.md)과 [공개 저장소 보안 기준](SECURITY.md)을 읽습니다.
