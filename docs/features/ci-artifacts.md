# 자동 검사와 공개 산출물

[투두 10](https://github.com/freevue/flex-mcp/issues/10) · [서비스 정책](../../SERVICE_POLICY.md) · [공개 저장소 보안 기준](../../SECURITY.md)

CI는 저장소의 변경을 자동으로 검사합니다. PR과 기본 브랜치에서 같은 검사 명령을 실행합니다. 프로젝트가 지정한 Node.js와 pnpm 버전을 사용합니다. [README의 빌드 명령](../../README.md)을 따릅니다.

## 검사 순서와 완료 기준

1. 저장소 루트에서 `pnpm install --frozen-lockfile`을 실행합니다.
2. `pnpm check`와 `pnpm test`를 실행합니다. 테스트에는 합성 데이터만 넣습니다.
3. 서버와 확장을 각각 빌드합니다. 서버 패키지와 확장 ZIP을 각각 만듭니다.
4. `pnpm package:public`에서 [공개 산출물 검사](../utilities/verify-public-artifact.md)로 두 파일의 내용과 경로를 확인합니다.

잠금 파일이 맞지 않거나 테스트가 실패하면 검사를 실패로 처리합니다. 금지 파일이나 링크가 섞여도 실패로 처리합니다. 압축 목록 검사와 별도로, 커밋 전에 공개 파일 내용도 확인합니다. 공개 CI에 실제 계정이나 운영 접근 정보를 넣지 않습니다. CI에서 실제 배포를 시작하지 않습니다. [GitHub Actions 보안 가이드](https://docs.github.com/en/actions/reference/security/secure-use)를 참고합니다.

CI는 Node 패키지와 Chrome 확장 ZIP을 검사합니다. 로컬 Workers 통합 테스트와 [Wrangler 번들 모의 검사](../mcp/workers-release.md)도 실행합니다. Worker를 배포하지 않습니다.

## 테스트 케이스

GitHub Actions에서 아래 항목을 확인합니다. 두 앱의 빌드와 산출물 검사는 로컬에서 먼저 확인했습니다. [로컬 패키징](../../scripts/packagePublicArtifacts.ts)과 [금지 파일 검사](../../scripts/verifyPublicArtifact.test.ts)를 참고합니다.

| TC | 확인 범위 | 준비와 실행 | 기대 결과 |
| --- | --- | --- | --- |
| TC-F-CI-ARTIFACTS-01 | CI | PR과 기본 브랜치에서 같은 잠금 파일과 버전으로 자동 검사를 실행합니다. | 설치, 타입 검사, 합성 테스트, 앱별 빌드와 패키징을 실행합니다. |
| TC-F-CI-ARTIFACTS-02 | CI | 잠금 파일과 의존성 선언이 맞지 않는 합성 변경을 검사합니다. | 잠금 파일 설치 단계가 실패합니다. 이후 단계에서 산출물을 만들지 않습니다. |
| TC-F-CI-ARTIFACTS-03 | CI | 두 앱을 빌드한 뒤 서버 패키지와 확장 ZIP을 각각 검사합니다. | 각 앱의 필수 파일을 확인합니다. 합성 금지 파일을 섞으면 검사가 실패합니다. |
| TC-F-CI-ARTIFACTS-04 | CI | 합성 테스트 하나를 실패시키고 로그와 후속 동작을 확인합니다. | 검사를 실패로 처리합니다. 실제 계정에 접속하거나 운영 배포를 시작하지 않습니다. |
