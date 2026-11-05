# flex MCP

flex의 본인 연차, 일정, 근무 시간을 조회하는 프로젝트입니다. Node.js 24, TypeScript, [npm workspaces](https://docs.npmjs.com/cli/v11/using-npm/workspaces/)로 두 앱을 한 저장소에서 관리합니다.

| 앱 | 현재 상태 | 독립 빌드 |
| --- | --- | --- |
| [MCP 서버](apps/mcp-server/README.md) | 로컬에서 도구 목록과 입력을 확인할 수 있습니다. 실제 조회는 연결하지 않았습니다. | `npm run build:mcp` → `apps/mcp-server/dist/` |
| [Chrome 확장](apps/chrome-extension/manifest.json) | Manifest V3와 TypeScript 서비스 워커 빌드 | `npm run build:extension` → `apps/chrome-extension/dist/` |

## 개발 환경

저장소 루트에서 실행합니다. nvm을 사용하면 `nvm use`로 Node.js 24를 선택할 수 있습니다.

```sh
npm ci
npm run check
npm test
npm run build
```

`npm start`는 기존 로컬 MCP를 소스에서 실행합니다. MCP 클라이언트 등록 방법은 [서버 사용 안내](apps/mcp-server/README.md)를 참고하세요.

## 배포 산출물 준비

- MCP 서버: 루트에서 `mkdir -p .artifacts`를 실행합니다. `npm pack --workspace @flex-mcp/server --pack-destination .artifacts`로 서버 패키지를 만듭니다. 배포 환경에서 Node.js 24와 런타임 의존성을 설치합니다.
- Chrome 확장: `npm run build:extension`을 실행합니다. `chrome://extensions`에서 개발자 모드를 켭니다. `apps/chrome-extension/dist/`를 압축을 푼 확장으로 로드합니다. ZIP이 필요하면 아래 명령을 실행합니다. [Chrome 확장 패키지 안내](https://developer.chrome.com/docs/extensions/reference/manifest)

```sh
mkdir -p .artifacts
npm run build:extension
(cd apps/chrome-extension/dist && zip -qrFS ../../../.artifacts/flex-chrome-extension.zip .)
```

두 앱은 따로 빌드할 수 있습니다. 원격 연결 구조는 [아키텍처](ARCHITECTURE.md)에서 봅니다. 구현할 함수의 입력과 출력은 [유틸 계약](UTILITIES.md)에서 봅니다.

작업 목록은 [GitHub 투두](https://github.com/freevue/flex-mcp/issues?q=is%3Aissue+label%3Atodo)에서 봅니다. 작업 절차는 [투두 운영](WORKFLOW.md)에 있습니다. 코드 변경 전에는 [로컬 개발 규칙](.agent/rules/GEMINI.md)과 [공개 저장소 보안 기준](SECURITY.md)을 읽습니다.
