# 갈피의 Chrome 웹 스토어 제출 안내

Chrome 웹 스토어 개발자 대시보드의 개인정보 보호 탭에 [갈피 개인정보 처리방침](https://freevue.github.io/flex-mcp/privacy/) 주소를 입력합니다. 이 주소는 심사자와 사용자가 로그인 없이 열 수 있어야 합니다.

배포 탭에서 공개 상태를 `Private`으로 선택합니다. 게시자 설정의 `Trusted testers`에 허용할 Google 계정만 추가합니다. 첫 심사 제출은 게시자가 개발자 대시보드에서 진행합니다.

[개인정보 입력 안내](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy) · [비공개 배포 안내](https://developer.chrome.com/docs/webstore/cws-dashboard-distribution)

## 처리방침 게시

[게시 원본](pages/privacy/index.html)은 `pages/` 아래에 있습니다. GitHub 저장소의 Settings → Pages에서 `Deploy from a branch`를 선택하고, `gh-pages`의 `/(root)`를 소스로 사용합니다.

`pages/`의 `.nojekyll`과 `privacy/index.html`만 `gh-pages` 루트에 둡니다. 확장 ZIP, 비공개 조회 코드, 인증값과 실제 사용자 데이터를 게시 파일에 넣지 않습니다.

게시 후 로그인하지 않은 브라우저에서 위 HTTPS 주소를 엽니다. 표시된 본문과 게시 원본이 일치하는지 확인합니다.

[처리방침 게시 정책](../../wiki/policy/galpi-privacy-page.md) · [GitHub Pages 게시 소스 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
