---
name: flex-mcp-development
description: flex MCP 저장소의 워크스페이스 경계, 검증 방식과 작업별 공용 정본을 안내합니다.
triger: always_on
---

# flex MCP 개발 규칙

이 저장소에 적용합니다. [README](../../README.md)와 [아키텍처](../../ARCHITECTURE.md)에서 현재 상태를 확인합니다. 이슈와 커밋은 [투두 운영](../../WORKFLOW.md)을 따릅니다.

- MCP 서버 변경은 `apps/mcp-server/`, Chrome 확장 변경은 `apps/chrome-extension/`에 둡니다. 각 앱은 다른 앱의 소스나 산출물 없이 빌드할 수 있어야 합니다.
- 루트에서 의존성을 설치하고 `package-lock.json` 하나를 관리합니다. 앱 전용 런타임 의존성은 해당 앱의 `package.json`에 둡니다.
- 브라우저 또는 MCP 경계에서 받는 입력을 검증합니다. 조회 대상과 브라우저 인증의 경계는 아키텍처 문서를 따릅니다. 인증값이나 개인 조회 결과를 테스트 데이터에 넣지 않습니다.
- 변경한 앱을 빌드하고 `npm run check`와 관련 테스트를 실행합니다. 로컬 검사, 실제 브라우저 조회, 배포 결과는 구분해서 기록합니다.
- 동작, 도구 계약, 배포 산출물이 바뀌면 연결된 Wiki 문서를 같은 변경에서 갱신합니다. 구현 예정인 내용은 현재 동작과 구분합니다.

## 작업별 공용 정본

공용 규칙을 쓰는 환경에서는 `~/.gemini/`의 정본을 읽습니다. 해당 디렉터리가 없으면 이 저장소의 규칙을 따릅니다.

| 작업 | 정본 |
| --- | --- |
| 코드 작성·수정·리뷰 | `~/.gemini/PONYTAIL_CONVENTIONS.md` |
| TypeScript 작성·수정 | `~/.gemini/CODE_CONVENTIONS.md` |
| 제품 지식과 문서 정리 | `~/.gemini/LLM_WIKI_CONVENTIONS.md` |
| 개발 규칙 문서나 규칙 트리 변경 | `~/.gemini/RULE_CONVENTIONS.md`, `~/.gemini/RULE_ARCHITECTURE.md` |
