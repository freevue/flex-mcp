# Workers 검증과 배포 절차

[배포 설계](cloudflare-workers.md) · [개발 명령](development.md) · [운영과 복구](../features/remote-operations.md) · [최종 검증](../features/release-verification.md)

이 절차는 저장소 루트의 Wrangler 설정을 사용합니다. Node 패키지는 별도입니다. 실계정은 [개인 설치본 검증](../features/extension-setup.md)에서 확인합니다.

## 개발 환경

| 개발 도구                              | 역할                                                 | 사용할 때                                                                          |
| -------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Node.js 24와 pnpm                      | 저장소 의존성과 Node 검사를 실행합니다.              | `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm test`, `pnpm package:public` |
| Wrangler                               | Workers를 로컬에서 실행하고 환경별로 배포합니다.     | 저장소 루트의 잠금 파일로 고정한 버전을 사용합니다.                                |
| MCP Inspector 또는 대상 MCP 클라이언트 | `tools/list`와 `tools/call`로 MCP 도구를 검사합니다. | 로컬 Worker와 승인된 검증 URL을 각각 확인합니다.                                   |
| Chrome 확장                            | 등록, 접속권과 소켓을 실제 브라우저에서 확인합니다.  | 검증용 프로필 두 개와 합성 모드부터 사용합니다.                                    |

Workers 설정의 배포 환경마다 도메인과 내부 바인딩을 선언합니다. 바인딩은 Worker에서 Cloudflare 서비스에 접근하는 이름입니다. [Durable Object 클래스 선언](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/)에 따라 `FlexBridge`를 SQLite 클래스로 등록합니다. 한 Worker 설정에서 `exports`와 이전 `migrations` 방식을 섞지 않습니다. `staging`과 `production`은 별도 저장소를 사용합니다. [Wrangler 환경 문서](https://developers.cloudflare.com/workers/wrangler/environments/)를 따릅니다.

실계정 자료로 검증 환경을 채우지 않습니다. Flex 로그인 정보는 Worker에 보내지 않습니다.

## 운영 도메인

`production` 환경은 `flex-mcp.freevue.dev`를 사용합니다. 아래 조각을 Workers 패키지의 Wrangler 설정에 합칩니다. `staging`에는 운영 도메인을 넣지 않습니다.

```json
{
  "env": {
    "production": {
      "routes": [{ "pattern": "flex-mcp.freevue.dev", "custom_domain": true }]
    }
  }
}
```

[Cloudflare Custom Domains 안내](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)를 따릅니다. 이미 이 도메인에서 응답하는 서비스가 있으면 현재 Worker 연결과 DNS를 확인한 뒤 변경합니다. 운영 배포 후에는 `https://flex-mcp.freevue.dev/mcp`에서 초기화와 도구 호출을 확인합니다. `wss://flex-mcp.freevue.dev/bridge`는 설치한 확장에서 별도로 확인합니다.

## Cloudflare 빌드 설정

Git 연결의 루트 디렉터리는 저장소 루트입니다. 대상 Worker 이름은 `flex-mcp`입니다. 대시보드의 이름이 다르면 Wrangler의 `env.production.name`과 맞춥니다. 빌드 명령은 `pnpm check:worker`입니다. 배포 명령은 `pnpm exec wrangler deploy --env production`입니다. Cloudflare에서 현재 변경을 포함한 커밋을 빌드할 때 사용합니다. 이전 커밋은 Wrangler와 Worker 진입점이 없습니다.

운영 브랜치는 `main`입니다. Cloudflare의 `Settings > Builds > Previews Base`에서 `Builds for Preview branches`를 끕니다. PR에는 Cloudflare Preview를 만들지 않습니다. 대신 `pnpm check:worker`와 `pnpm build:worker`로 확인합니다. [공통 릴리스 정책](../../wiki/policy/mcp-release.md)을 따릅니다.

Worker에 별도 확장 ID, 에이전트 목록과 Flex 인증 값을 등록하지 않습니다. 배포 후 `/mcp`에서 초기화와 도구 목록을 확인합니다. Chrome 팝업에서 코드를 발급합니다. MCP 승인으로 받은 연결 키를 조회 도구의 인자로 보냅니다. [등록 순서](../features/browser-pairing.md)를 따릅니다.

연결 키를 도입하기 전에 만든 등록이면 팝업에서 새 코드를 발급합니다. 이미 연결 키를 받은 채널은 이번 확장과 Worker를 업데이트해도 기존 키를 사용합니다. 다른 클라이언트를 연결하려면 팝업에서 `코드 확인`을 누릅니다.

## 검증 순서

1. 저장소 루트에서 Node 자동 검사와 공개 산출물 검사를 실행합니다.
2. 저장소 루트에서 `pnpm exec wrangler dev --env staging`으로 로컬 실행을 확인합니다.
3. 저장소 루트에서 `pnpm build:worker`로 운영 번들과 설정을 모의 검사합니다.
4. 검증 환경 배포를 승인한 뒤 저장소 루트에서 `pnpm exec wrangler deploy --env staging`을 실행합니다.
5. 배포한 검증 URL에서 초기화와 도구 목록을 확인합니다. Chrome 두 프로필로 등록, 승인, 조회와 복구를 확인합니다. 공개 빌드의 검증에는 합성 자료를 사용합니다.
6. 승인된 실제 조회 코드를 연결한 뒤, 승인된 한 계정으로 Flex 화면과 도구 결과를 대조합니다.
7. 운영 환경의 합성 검증 배포를 준비했으면 `pnpm exec wrangler deploy --env production`을 실행합니다. 실제 운영 전환은 승인된 Flex 조회 검증을 마친 뒤 수행합니다.

[Wrangler 명령 문서](https://developers.cloudflare.com/workers/wrangler/commands/workers/)를 참조합니다. 로컬 실행, 번들 검사, 검증 URL, 설치한 Chrome, 실계정과 운영 결과를 따로 기록합니다. 산출물 목록과 배포 버전은 기록합니다. 토큰, 응답 본문과 사내 휴무 원본은 기록하지 않습니다.

## 중단과 복구

새 조회를 먼저 중단합니다. 대기 중인 요청을 종료합니다. 현재 저장 구조를 읽을 수 있는 이전 버전만 선택합니다. [Workers 롤백 문서](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)를 확인합니다. Durable Object 클래스 수명 주기 변경 뒤에는 코드 롤백이 차단될 수 있습니다. 코드 복구와 데이터 복구는 별도입니다.

복구 후에는 등록과 권한을 다시 확인합니다. 소켓이 복구된 뒤 새 요청 하나를 실행합니다. 이전에 끝낸 조회가 재실행되면 운영을 다시 열지 않습니다.

| TC              | 환경과 실행                                                       | 기대 결과                                                                                |
| --------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| TC-W-RELEASE-01 | 로컬 Worker에서 각 도구를 확인하고 입력을 잘못 보냅니다.          | 의도한 도구만 표시하고, 잘못된 인자는 브라우저로 보내지 않습니다.                        |
| TC-W-RELEASE-02 | 검증 URL에서 유효한 코드와 폐기한 연결 키를 시험합니다.           | 승인 뒤 등록을 수령한 채널의 연결 키만 사용합니다. 실패한 호출에 자료를 보내지 않습니다. |
| TC-W-RELEASE-03 | 검증 URL에 Chrome 두 프로필을 연결합니다. 한 프로필을 해제합니다. | 다른 프로필의 결과와 소켓은 유지됩니다.                                                  |
| TC-W-RELEASE-04 | 배포 중 소켓을 교체하거나 저장 스키마를 바꿉니다.                 | 이전 연결의 결과를 받지 않습니다. 복구 가능한 버전을 확인합니다.                         |
| TC-W-RELEASE-05 | 승인된 실계정의 연차, 일정, 근무와 놀수 요약을 대조합니다.        | 실제 화면과 도구가 일치합니다. 확인하지 못한 필드를 따로 기록합니다.                     |
