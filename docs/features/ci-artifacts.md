# 로컬 검사와 Chrome 확장 릴리스

[투두 10](https://github.com/freevue/flex-mcp/issues/10) · [확장 설치](extension-setup.md)

## Git 훅

Git 훅은 커밋과 푸시 전에 실행하는 명령입니다. 저장소 루트에서 Node.js 24와 [지정한 pnpm 버전](../../package.json)을 사용합니다.

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium --no-shell
```

첫 명령이 Husky 훅을 설정합니다. 설정이 빠졌으면 저장소 루트에서 `pnpm run prepare`를 실행합니다. 두 번째 명령은 브라우저 검사용 Chromium을 설치합니다. Linux에서 Chromium의 시스템 라이브러리가 없으면 설치 명령에 `--with-deps`를 추가합니다.

| 훅           | 실행 내용                                                                               |
| ------------ | --------------------------------------------------------------------------------------- |
| `pre-commit` | 커밋에 올린 파일만 Prettier로 정리합니다.                                               |
| `pre-push`   | 타입 검사, 단위·통합 테스트와 브라우저 테스트를 실행합니다. 실패하면 푸시를 중단합니다. |

`pnpm test:e2e`는 새 Chromium 프로필과 로컬 MCP로 승인부터 조회까지 검사합니다. 합성 자료는 검증용 예시입니다. 이 테스트는 실제 계정이나 운영 MCP에 접속하지 않습니다.

## Chrome 확장 릴리스

릴리스할 커밋에 [Chrome 확장 워크플로](../../.github/workflows/chrome-extension.yml)가 있어야 합니다. 배포할 버전으로 `chrome-v*` 태그를 만든 뒤 태그를 푸시합니다.

```sh
git tag -a chrome-v0.1.0 -m 'Chrome 확장 0.1.0'
git push origin chrome-v0.1.0
```

Actions는 확장 ZIP을 만들고 [공개 산출물 검사](../utilities/verify-public-artifact.md)로 파일 목록을 확인합니다. 검사를 통과하면 [GitHub Releases](https://github.com/freevue/flex-mcp/releases)에 `flex-chrome-extension.zip`을 첨부합니다. 팀원은 ZIP을 풀고 Chrome에서 `manifest.json`이 있는 폴더를 로드합니다.

ZIP은 운영 MCP에 연결하는 합성 검증용입니다. 공개 Releases에 개인 설치본, 실제 Flex 조회 코드와 연결 키를 넣지 않습니다. 이 워크플로는 Chrome Web Store나 Worker를 배포하지 않습니다. PR과 `main` 푸시에서는 실행되지 않습니다.

| TC                   | 실행                                              | 기대 결과                                                                              |
| -------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------- |
| TC-F-CI-ARTIFACTS-01 | 서식이 맞지 않는 파일을 스테이지한 뒤 커밋합니다. | Prettier가 스테이지한 파일을 정리합니다.                                               |
| TC-F-CI-ARTIFACTS-02 | `pnpm test:e2e`를 실행합니다.                     | 새 Chromium에서 코드를 받고 MCP에서 승인합니다. 팝업과 MCP에서 합성 결과를 확인합니다. |
| TC-F-CI-ARTIFACTS-03 | `pnpm package:extension`을 실행합니다.            | 허용된 파일만 포함한 확장 ZIP을 만듭니다.                                              |
| TC-F-CI-ARTIFACTS-04 | 릴리스할 `chrome-v*` 태그를 푸시합니다.           | 해당 GitHub Release에서 확장 ZIP을 다운로드할 수 있습니다.                             |
