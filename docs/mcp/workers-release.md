# Workers 검증과 배포 절차

[배포 설계](cloudflare-workers.md) · [개발 명령](development.md) · [운영과 복구](../features/remote-operations.md) · [최종 검증](../features/release-verification.md)

상태: 합성 검증용 Worker 구현. 이 절차는 저장소 루트의 Wrangler 설정을 사용합니다. Node 패키지는 별도입니다. 실제 Flex 데이터와 OAuth는 운영에 연결하지 않았습니다.

## 개발 환경

| 개발 도구 | 역할 | 사용할 때 |
| --- | --- | --- |
| Node.js 24와 pnpm | 저장소 의존성과 Node 검사를 실행합니다. | `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm test`, `pnpm package:public` |
| Wrangler | Workers를 로컬에서 실행하고 환경별로 배포합니다. | 저장소 루트의 잠금 파일로 고정한 버전을 사용합니다. |
| MCP Inspector 또는 대상 MCP 클라이언트 | `tools/list`와 `tools/call`로 MCP 도구를 검사합니다. | 로컬 Worker와 승인된 검증 URL을 각각 확인합니다. |
| Chrome 확장 | 등록, 접속권과 소켓을 실제 브라우저에서 확인합니다. | 검증용 프로필 두 개와 합성 모드부터 사용합니다. |

Workers 설정의 배포 환경마다 도메인, 출처 허용 목록과 내부 바인딩을 선언합니다. 바인딩은 Worker에서 Cloudflare 서비스에 접근하는 이름입니다. [Durable Object 클래스 선언](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/)에 따라 `FlexBridge`를 SQLite 클래스로 등록합니다. 한 Worker 설정에서 `exports`와 이전 `migrations` 방식을 섞지 않습니다. `staging`과 `production`은 별도 저장소와 별도 인증 설정을 사용합니다. [Wrangler 환경 문서](https://developers.cloudflare.com/workers/wrangler/environments/)를 따릅니다.

OAuth 비밀값은 [Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)에 둡니다. 환경 변수의 공개 값 영역과 설정 파일에는 넣지 않습니다. 비밀값 변경 명령이 새 버전을 즉시 배포할 수 있는지 확인한 뒤 사용합니다. 실계정 자료로 검증 환경을 채우지 않습니다.

## 운영 도메인

`production` 환경은 `flex-mcp.freevue.dev`를 사용합니다. 아래 조각을 Workers 패키지의 Wrangler 설정에 합칩니다. `staging`에는 운영 도메인을 넣지 않습니다.

```json
{
  "env": {
    "production": {
      "routes": [
        { "pattern": "flex-mcp.freevue.dev", "custom_domain": true }
      ]
    }
  }
}
```

[Cloudflare Custom Domains 안내](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)를 따릅니다. 이미 이 도메인에서 응답하는 서비스가 있으면 현재 Worker 연결과 DNS를 확인한 뒤 변경합니다. 운영 배포 후에는 `https://flex-mcp.freevue.dev/mcp`에서 인증과 도구 호출을 확인합니다. `wss://flex-mcp.freevue.dev/bridge`는 설치한 확장에서 별도로 확인합니다.

## Cloudflare 빌드 설정

Git 연결의 루트 디렉터리는 저장소 루트입니다. 대상 Worker 이름은 `flex-mcp`입니다. 대시보드의 이름이 다르면 Wrangler의 `env.production.name`과 맞춥니다. 빌드 명령은 `pnpm check:worker`입니다. 배포 명령은 `pnpm exec wrangler deploy --env production`입니다. Cloudflare에서 현재 변경을 포함한 커밋을 빌드할 때 사용합니다. 이전 커밋은 Wrangler와 Worker 진입점이 없습니다.

`production` 환경은 다음 값을 설정한 뒤 실행합니다. `staging`에도 별도의 검증용 값을 사용합니다.

| 이름 | 값 |
| --- | --- |
| `FLEX_EXTENSION_IDS` | 허용할 확장 ID를 쉼표로 구분한 값입니다. Chrome에서 설치한 뒤 ID를 확인합니다. |
| `FLEX_WORKER_AGENTS` | 승인한 에이전트의 설정 배열입니다. Workers Secrets에 등록합니다. 원문 키는 배열에 넣지 않습니다. |

저장소 루트에서 아래 명령을 실행합니다. `sample-owner`는 검증용 사용자 ID입니다. 조회 전용 키를 만들려면 `--approve`를 생략합니다.

```sh
pnpm flex:worker-agent sample-owner --approve
```

결과의 `agent` 객체만 배열에 넣습니다. `key` 값은 해당 에이전트의 `Authorization: Bearer <key>` 설정에만 넣습니다. 배열의 각 객체는 `callerId`, `ownerId`, `keyDigest`, `canApprove`를 담습니다. 설정이 없거나 잘못되면 Worker가 `503 WORKER_NOT_CONFIGURED`를 반환합니다.

## 검증 순서

1. 저장소 루트에서 Node 자동 검사와 공개 산출물 검사를 실행합니다.
2. 저장소 루트에서 `pnpm exec wrangler dev --env staging`으로 로컬 실행을 확인합니다.
3. 저장소 루트에서 `pnpm build:worker`로 운영 번들과 설정을 모의 검사합니다.
4. 검증 환경 배포를 승인한 뒤 저장소 루트에서 `pnpm exec wrangler deploy --env staging`을 실행합니다.
5. 배포한 검증 URL에서 인증과 도구 목록을 확인합니다. Chrome 두 프로필로 등록, 승인, 조회와 복구를 확인합니다. 현재 빌드는 합성 조회만 허용합니다.
6. OAuth와 실제 조회를 연결한 뒤, 승인된 한 계정으로 Flex 화면과 도구 결과를 대조합니다.
7. 운영 환경의 합성 검증 배포를 준비했으면 `pnpm exec wrangler deploy --env production`을 실행합니다. 실제 운영 전환은 OAuth와 승인된 Flex 조회 검증을 마친 뒤 수행합니다.

[Wrangler 명령 문서](https://developers.cloudflare.com/workers/wrangler/commands/workers/)를 참조합니다. 로컬 실행, 번들 검사, 검증 URL, 설치한 Chrome, 실계정과 운영 결과를 따로 기록합니다. 산출물 목록과 배포 버전은 기록합니다. 토큰, 응답 본문과 사내 휴무 원본은 기록하지 않습니다.

## 중단과 복구

새 조회를 먼저 중단합니다. 대기 중인 요청을 종료합니다. 현재 저장 구조를 읽을 수 있는 이전 버전만 선택합니다. [Workers 롤백 문서](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)를 확인합니다. Durable Object 클래스 수명 주기 변경 뒤에는 코드 롤백이 차단될 수 있습니다. 코드 복구와 데이터 복구는 별도입니다.

복구 후에는 등록과 권한을 다시 확인합니다. 소켓이 복구된 뒤 새 요청 하나를 실행합니다. 이전에 끝낸 조회가 재실행되면 운영을 다시 열지 않습니다.

| TC | 환경과 실행 | 기대 결과 |
| --- | --- | --- |
| TC-W-RELEASE-01 | 로컬 Worker에서 각 도구를 확인하고 입력을 잘못 보냅니다. | 의도한 도구만 표시하고, 잘못된 인자는 브라우저로 보내지 않습니다. |
| TC-W-RELEASE-02 | 검증 URL에서 정상 OAuth와 만료·회수한 토큰을 시험합니다. | 인증된 권한만 적용합니다. 실패한 호출에 자료를 보내지 않습니다. |
| TC-W-RELEASE-03 | 검증 URL에 Chrome 두 프로필을 연결합니다. 한 프로필을 해제합니다. | 다른 프로필의 결과와 소켓은 유지됩니다. |
| TC-W-RELEASE-04 | 배포 중 소켓을 교체하거나 저장 스키마를 바꿉니다. | 이전 연결의 결과를 받지 않습니다. 복구 가능한 버전을 확인합니다. |
| TC-W-RELEASE-05 | 승인된 실계정의 연차, 일정, 근무와 놀수 요약을 대조합니다. | 실제 화면과 도구가 일치합니다. 확인하지 못한 필드를 따로 기록합니다. |
