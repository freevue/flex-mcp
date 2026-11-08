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

## [2026-11-08] spec | #25 | 내 회사 휴일

- [내 회사 휴일](feature/flex-company-holidays.md)의 조회 범위와 응답 검사를 추가합니다.

## [2026-11-08] spec | #25 | 갈피와 MCP 0.9.0 릴리스

- [공통 릴리스 정책](policy/mcp-release.md)에 0.9.0을 기록합니다.

## [2026-11-08] spec | #31 | 갈피 개인정보 처리방침 게시

- [처리방침 게시 정책](policy/galpi-privacy-page.md)에 정보 처리 설명과 게시 후 확인 기준을 기록합니다.

## [2026-11-08] spec | #35 | 내 MCP 연결 해제

- [내 MCP 연결 해제](feature/flex-disconnect-connection.md)에 현재 키 폐기와 마지막 Chrome 소켓 종료 조건을 기록합니다.
