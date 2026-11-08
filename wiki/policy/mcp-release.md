---
name: mcp-release
type: policy
issues: [22, 25, 26, 33]
code: []
---

# MCP와 갈피 릴리스 정책

MCP와 갈피는 같은 버전으로 릴리스합니다. 작업 브랜치는 배포 없이 검증합니다.

## 규칙

| ID                 | 규칙                                                                                                                                                                   | 근거                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| POL-MCP-RELEASE-01 | Cloudflare에서 PR용 Preview 빌드를 끕니다. 운영 브랜치는 `main`을 유지합니다. PR의 Worker는 모의 빌드와 자동 검사로 확인합니다.                                        | [#22](https://github.com/freevue/flex-mcp/issues/22) |
| POL-MCP-RELEASE-02 | 루트, MCP 서버와 갈피의 `package.json`, 갈피 `manifest.json`에 같은 버전을 씁니다. 이번 릴리스의 공통 버전은 `0.9.1`입니다.                                            | [#22](https://github.com/freevue/flex-mcp/issues/22) |
| POL-MCP-RELEASE-03 | 릴리스할 때 숫자 태그와 갈피 ZIP의 버전을 일치시킵니다. README는 소스 버전과 내려받을 수 있는 공개 릴리스를 구분합니다. 운영 배포 후에는 MCP 초기화 버전도 확인합니다. | [#22](https://github.com/freevue/flex-mcp/issues/22) |

## 적용 기능

| 기능                                                         | 적용 규칙             |
| ------------------------------------------------------------ | --------------------- |
| [MCP 근무 요약 표시](../feature/mcp-work-summary-display.md) | POL-MCP-RELEASE-01~03 |
| [갈피 ZIP 릴리스](../../docs/features/ci-artifacts.md)       | POL-MCP-RELEASE-02~03 |
