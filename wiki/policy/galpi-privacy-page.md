---
name: galpi-privacy-page
type: policy
issues: [31]
code: []
---

# 갈피 개인정보 처리방침 게시 정책

이 정책은 Chrome 웹 스토어에서 지정한 테스터에게 배포하는 본인 Flex 조회용 갈피에 적용합니다.

## 규칙

| ID                   | 규칙                                                                                                                                                                                              | 근거                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| POL-GALPI-PRIVACY-01 | 본인 연차, 근무 시간과 상태, 기본 캘린더 미팅의 날짜와 시간대가 승인한 MCP 클라이언트로 전달되는 과정을 설명합니다. 미팅 제목과 참석자, 팀 일정, 다른 구성원 프로필은 범위에서 제외합니다.        | [#31](https://github.com/freevue/flex-mcp/issues/31) |
| POL-GALPI-PRIVACY-02 | Chrome에 남는 연결 정보와 계정 비교용 해시, 갈피 서버에 남는 연결 등록 정보, MCP 클라이언트에 남을 수 있는 조회 결과를 구분합니다. Cloudflare 처리 범위는 배포 구성에서 확인한 내용만 단정합니다. | [#31](https://github.com/freevue/flex-mcp/issues/31) |
| POL-GALPI-PRIVACY-03 | 방침에 확정한 게시자 표시명, 비공개 문의 이메일과 시행일을 표시합니다. 사용 중지, 연결 해제와 삭제 요청 방법을 안내합니다.                                                                        | [#31](https://github.com/freevue/flex-mcp/issues/31) |
| POL-GALPI-PRIVACY-04 | GitHub Pages에서 로그인 없이 HTTPS로 `/privacy/`를 엽니다. `gh-pages` 루트에는 `.nojekyll`과 `privacy/index.html`만 둡니다. 페이지는 외부 스크립트와 추적기를 불러오지 않습니다.                  | [#31](https://github.com/freevue/flex-mcp/issues/31) |
| POL-GALPI-PRIVACY-05 | 제출 안내에 HTTPS 주소와 Chrome 웹 스토어의 Private 및 Trusted testers 설정을 기록합니다. 첫 제출은 게시자가 합니다.                                                                              | [#31](https://github.com/freevue/flex-mcp/issues/31) |

## 적용 기능

| 기능                                                       | 적용 규칙               |
| ---------------------------------------------------------- | ----------------------- |
| [처리방침 게시와 제출 안내](../../docs/webstore/README.md) | POL-GALPI-PRIVACY-01~05 |
