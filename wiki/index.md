---
name: index
type: index
---

# Wiki Index

이 wiki는 코드가 따라야 하는 명세입니다. 코드와 다르면 코드를 고칩니다.

## 정책

| 페이지                                                      | 설명                                                |
| ----------------------------------------------------------- | --------------------------------------------------- |
| [갈피 근무 대시보드](policy/galpi-work-dashboard.md)        | 연결 상태, 근무 표시와 상세 조회의 경계를 정합니다. |
| [갈피 개인정보 처리방침 게시](policy/galpi-privacy-page.md) | 공개 방침과 비공개 확장 배포 범위를 정합니다.       |
| [MCP와 갈피 릴리스](policy/mcp-release.md)                  | 공통 버전과 PR 검증 범위를 정합니다.                |

## 기능

| 페이지                                                    | 설명                                                       |
| --------------------------------------------------------- | ---------------------------------------------------------- |
| [갈피 근무 대시보드](feature/galpi-work-dashboard.md)     | 팝업 표시 순서와 MCP 상세 조회를 설명합니다.               |
| [내 회사 휴일](feature/flex-company-holidays.md)          | 본인에게 적용되는 휴일을 읽습니다.                         |
| [본인 근무 상태](feature/flex-work-status.md)             | 승인한 연결에서 현재 기록 상태를 읽습니다.                 |
| [내 MCP 연결 해제](feature/flex-disconnect-connection.md) | 사용한 키를 폐기하고 마지막 연결의 소켓을 닫습니다.        |
| [MCP 근무 요약 표시](feature/mcp-work-summary-display.md) | 근무 요약 응답의 JSON과 화면 표시용 Markdown을 정의합니다. |

## 유닛

| 페이지                                                             | 설명                                                  |
| ------------------------------------------------------------------ | ----------------------------------------------------- |
| [popupButton](unit/popup/popupButton.md)                           | 팝업에서 실행할 동작을 가진 버튼을 만듭니다.          |
| [renderApprovalCode](unit/popup/renderApprovalCode.md)             | 승인 대기 화면에 코드와 복사 버튼을 표시합니다.       |
| [renderUnavailablePopup](unit/popup/renderUnavailablePopup.md)     | MCP가 연결되기 전의 팝업 내용을 만듭니다.             |
| [renderConnectionRows](unit/popup/renderConnectionRows.md)         | 연결된 팝업에 MCP와 Flex 상태를 표시합니다.           |
| [renderWorkSummary](unit/popup/renderWorkSummary.md)               | 근무 요약 영역에 오늘 근무와 월 비교 값을 표시합니다. |
| [formatWorkMinutes](unit/popup/formatWorkMinutes.md)               | 분 단위의 근무 시간을 화면 문구로 바꿉니다.           |
| [formatWorkSummaryMarkdown](unit/mcp/formatWorkSummaryMarkdown.md) | 검증한 근무 수치로 Markdown을 만듭니다.               |

| [disconnectMcpConnection](unit/mcp/disconnectMcpConnection.md) | MCP 키와 마지막 Chrome 등록을 해제합니다. |
| [registerPairedReadTools](unit/mcp/registerPairedReadTools.md) | 연결 키가 필요한 근무 읽기 도구를 등록합니다. |
| [readLiveReply](unit/bridge/readLiveReply.md) | 승인된 Flex 조회 결과를 응답으로 바꿉니다. |
| [isCompanyHolidays](unit/shared/isCompanyHolidays.md) | 기간과 휴일 응답을 검증합니다. |
| [isWorkStatusResult](unit/shared/isWorkStatusResult.md) | 근무 상태 응답의 값과 모양을 검사합니다. |

## 타입

| 페이지                                                        | 설명                                         |
| ------------------------------------------------------------- | -------------------------------------------- |
| [CompanyHolidaysResult](type/shared/CompanyHolidaysResult.md) | 기간과 본인 휴일의 목록입니다.               |
| [FlexReader](type/bridge/FlexReader.md)                       | 승인된 Chrome 프로필의 Flex 읽기 계약입니다. |
| [WorkStatusResult](type/shared/WorkStatusResult.md)           | 근무 기록의 현재 상태입니다.                 |
