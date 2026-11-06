# flex MCP LLM Wiki

LLM Wiki는 확인한 프로젝트 지식을 정리하고 다시 찾는 방식입니다. 이 문서에서 필요한 정본으로 이동합니다. 정본은 해당 주제를 관리하는 문서입니다.

| 계층 | 어디서 확인하는가 |
| --- | --- |
| 1. 원천 | [서버 코드](apps/mcp-server/src/), [서버 테스트](apps/mcp-server/test/), [확장 코드](apps/chrome-extension/src/), [확장 테스트](apps/chrome-extension/test/), [공통 코드](shared/), [자동 검사](.github/workflows/check.yml), [워크스페이스 설정](pnpm-workspace.yaml), [GitHub 투두](https://github.com/freevue/flex-mcp/issues?q=is%3Aissue+label%3Atodo)에서 구현과 검증 근거를 확인합니다. |
| 2. 지식 | 아래 정본에서 실행법, 구조, 도구와 함수 계약을 확인합니다. |
| 3. 규칙 | [AGENTS.md](AGENTS.md)는 에이전트 진입점입니다. [개발 규칙](.agent/rules/GEMINI.md), [투두 운영](WORKFLOW.md), [공개 저장소 보안 기준](SECURITY.md)에 작업 절차를 둡니다. |

| 찾는 내용 | 정본 |
| --- | --- |
| 설치, 빌드, 패키지 | [README](README.md) |
| 현재 동작과 원격 연결 설계 | [아키텍처](ARCHITECTURE.md) |
| 첫 운영 범위, 실조회 조건, 보안과 배포 정책 | [서비스 정책](SERVICE_POLICY.md) |
| 공유 MCP에서 Chrome 등록, 인증, 요청 전달 | [공유 연결 흐름](docs/features/shared-connection-flow.md) |
| 두 사용자로 설치와 재접속 확인 | [직접 검증](docs/features/shared-connection-check.md) |
| 확장이 시작하는 등록과 에이전트 승인 | [Chrome 등록 순서도](docs/features/browser-pairing.md) |
| Chrome 팝업, 에이전트 승인과 재연결 | [화면 구성](docs/features/extension-ui-plan.md) · [디자인 기준](DESIGN.md) |
| 화면과 공용 컴포넌트 | [연결](docs/screens/connection.md), [상태](docs/screens/status.md), [근무 요약](docs/screens/work-summary.md), [에이전트 승인](docs/screens/agent-approval.md) · [공용 컴포넌트](docs/components/README.md) |
| 확장 팝업의 월 근무 요약과 휴무 계산 | [근무 요약과 휴무 계산](docs/features/extension-work-summary.md) |
| MCP 도구, 입력과 테스트 케이스 | [MCP 개발 문서](docs/mcp/README.md) · [서버 실행 안내](apps/mcp-server/README.md) |
| MCP 서버의 함수와 매개변수 | [서버 함수 목록](docs/mcp/functions.md) |
| Cloudflare Workers 배포 구조와 검증 | [배포 설계](docs/mcp/cloudflare-workers.md) · [배포 절차](docs/mcp/workers-release.md) |
| 투두별 기능, 메시지 계약, 기능 테스트 케이스 | [기능 목록](docs/features/README.md) |
| 함수별 구현 위치, 이름, 매개변수와 단위 테스트 케이스 | [유틸 계약](UTILITIES.md) |

## 읽고 갱신하기

1. 개발 규칙을 읽고 이 문서에서 작업과 관련된 정본을 찾습니다.
2. 코드, 테스트 또는 투두에서 바뀐 사실을 확인합니다. 확인한 내용과 근거 링크를 해당 정본에 적습니다.
3. 변경 후 문서와 코드가 같은 내용을 설명하는지 확인합니다. 깨진 링크를 고칩니다. 구현, 실제 조회, 배포는 확인한 범위만 기록합니다.
