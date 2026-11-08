---
name: mcp-work-summary-display
type: feature
issues: [22]
code:
  [
    apps/mcp-server/src/createMcpServer.ts,
    apps/mcp-server/src/formatWorkSummaryMarkdown.ts,
  ]
---

# MCP 근무 요약 표시

에이전트는 `flex_get_work_summary`의 성공 응답에서 근무 수치와 같은 값을 담은 Markdown을 읽을 수 있습니다.

## 구성 유닛

| 유닛                                                                  | 역할                                                   |
| --------------------------------------------------------------------- | ------------------------------------------------------ |
| [formatWorkSummaryMarkdown](../unit/mcp/formatWorkSummaryMarkdown.md) | 검증한 근무 수치와 고정 문구로 표시할 본문을 만듭니다. |

## 흐름

1. 클라이언트가 기존 `connectionKey`로 `flex_get_work_summary`를 호출합니다. 입력, 연결 권한과 조회는 [기존 도구 계약](../../docs/mcp/tools/flex-get-work-summary.md)을 따릅니다.
2. 조회가 실패하면 기존 오류를 반환합니다. Markdown은 붙이지 않습니다.
3. 조회가 성공하면 기존 결과 객체를 `structuredContent`로 반환합니다. 첫 번째 `content` 항목에는 같은 객체를 직렬화한 JSON 텍스트를 넣습니다.
4. 근무 요약이 검증을 통과하면, 두 번째 `content` 항목에 `type: "text"`인 Markdown을 넣습니다. 검증할 수 없으면 기존 결과만 반환합니다.
5. 다른 도구는 기존 응답을 그대로 반환합니다. Chrome과 Worker 사이의 메시지, 연결 키와 재연결 방식은 바뀌지 않습니다.

## 관련 정책

| 정책                                                            | 규칙                                                                                            |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [실조회 범위](../../docs/features/reading-boundary.md)          | 조회는 연결한 계정에 한정합니다. 표시용 Markdown에는 서버가 정한 문구와 검증한 시간만 넣습니다. |
| [근무 요약 계산](../../docs/features/extension-work-summary.md) | 오늘 실제 근무, 연차 포함·미포함 합계와 놀수 전후 예상값을 구분합니다.                          |

MCP Markdown의 놀수 순서는 미반영, 반영입니다. [Chrome 팝업](../../docs/screens/work-summary.md)에서만 놀수 반영을 왼쪽에, 미반영을 오른쪽에 표시합니다. 배포는 [공통 릴리스 정책](../policy/mcp-release.md)을 따릅니다.

## TC

| ID                     | 조건                                                                          | 동작                           | 기대 결과                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------- |
| FT-MCP-WORK-DISPLAY-01 | Node 또는 Worker에서 승인한 연결을 엽니다.                                    | 요약을 조회합니다.             | 기존 JSON 객체와 첫 JSON 텍스트가 같습니다. 두 번째 텍스트에 같은 결과의 Markdown이 있습니다. |
| FT-MCP-WORK-DISPLAY-02 | 합성 응답과 실제 출처를 표시한 모의 응답을 준비합니다.                        | 두 연결에서 요약을 조회합니다. | 합성 응답의 Markdown에만 예시임을 표시합니다.                                                 |
| FT-MCP-WORK-DISPLAY-03 | 연결이 오프라인이거나 키를 누락했습니다. 또는 키가 미등록이거나 해제됐습니다. | 요약을 조회합니다.             | 기존 오류 응답에 두 번째 텍스트가 없습니다.                                                   |
| FT-MCP-WORK-DISPLAY-04 | 같은 승인 키를 사용합니다.                                                    | 일정과 요약을 각각 조회합니다. | 일정 응답은 기존 텍스트 한 항목과 JSON만 반환합니다.                                          |

기능 TC는 [채널 통합 검사](../../apps/mcp-server/test/checkPairedChannels.ts)를 사용합니다. 이 검사는 Node와 로컬 Worker에서 같은 계약을 확인합니다.
