---
name: log
type: log
---

# Wiki Log

항목 형식은 `## [YYYY-MM-DD] {spec|ingest|lint} | #N | 제목`입니다. 최신 항목을 아래에 추가합니다.

## [2026-11-07] spec | #22 | 갈피 근무 대시보드

- [대시보드 정책](policy/galpi-work-dashboard.md)과 [기능](feature/galpi-work-dashboard.md)을 추가했습니다.
- 팝업 유닛 6개의 시그니처, 표시 동작과 TC를 추가했습니다.

## [2026-11-07] spec | #22 | MCP 근무 요약 표시

- [MCP 표시 형식](feature/mcp-work-summary-display.md)과 [Markdown 변환 유닛](unit/mcp/formatWorkSummaryMarkdown.md)을 추가했습니다.

## [2026-11-08] spec | #22 | 공통 버전과 PR Preview 정책

- [MCP와 갈피 릴리스](policy/mcp-release.md)를 추가했습니다.
- [갈피 근무 요약 화면](../docs/screens/work-summary.md)에 놀수 반영 값의 위치를 기록했습니다.

## [2026-11-08] lint | #22 | 갈피 팝업 명세와 테스트 정리

- [갈피 근무 대시보드](feature/galpi-work-dashboard.md)의 남은 시간 순서를 0.8.5 화면에 맞췄습니다.
- 팝업의 놀수 반영은 왼쪽, 미반영은 오른쪽입니다. MCP Markdown의 순서는 유지합니다.

## [2026-11-08] spec | #26 | 본인 근무 상태

- [본인 근무 상태](feature/flex-work-status.md)와 응답 타입, 등록 및 읽기 유닛을 추가합니다.
- [갈피 근무 대시보드](feature/galpi-work-dashboard.md)와 [팝업 표시 유닛](unit/popup/renderWorkSummary.md)에 시안과 상태별 TC를 반영합니다.
