# MCP 서버 개발 도구

[도구 목록](README.md) · [서버 실행 안내](../../apps/mcp-server/README.md) · [Workers 배포 절차](workers-release.md)

현재 개발 도구는 Node 서버와 Chrome 확장을 검사합니다. Workers 검증 빌드는 저장소 루트의 Wrangler 설정을 사용합니다.

| 명령 | 입력과 동작 | 함수와 결과 |
| --- | --- | --- |
| `pnpm check` | 저장소 루트에서 실행합니다. 스크립트와 두 앱의 타입을 확인합니다. | 각 앱의 TypeScript 설정을 사용합니다. |
| `pnpm check:worker` | Worker의 타입만 확인합니다. | Worker 진입점과 저장소 어댑터를 검사합니다. |
| `pnpm build:worker` | 운영 설정으로 번들을 만듭니다. | Wrangler 모의 실행입니다. 배포하지 않습니다. |
| `pnpm test` | 저장소 루트에서 실행합니다. 자동 검사에 합성 자료를 사용합니다. | 도구, 등록, 소켓 중계와 공개 압축 검사 결과를 냅니다. |
| `pnpm build:mcp` | 저장소 루트에서 실행합니다. Node 서버를 빌드합니다. | `apps/mcp-server/dist/index.js`를 만듭니다. |
| `pnpm package:public` | 저장소 루트에서 실행합니다. 서버와 확장을 각각 포장합니다. | [verifyPublicArtifact](../utilities/verify-public-artifact.md)가 필수 파일과 허용 범위를 검사합니다. |
| `pnpm flex:remote` | 로컬 상태 파일과 공개 주소를 설정합니다. | [openStateDatabase](../utilities/open-state-database.md)와 [createRemoteServer](../utilities/create-remote-server.md)를 실행합니다. |
| `pnpm --filter @flex-mcp/server run demo:query` | 검증용 클라이언트에 `FLEX_PUBLIC_URL`과 `FLEX_CONNECTION_KEY`를 설정합니다. | 원격 Node 서버의 [일정 도구](tools/flex-get-schedule.md)를 호출합니다. |

환경 변수 설정과 두 프로필 검증 순서는 [합성 검증 절차](../features/shared-connection-check.md)를 따릅니다. 키 원문을 공유 로그나 공개 문서에 붙이지 않습니다.

| TC | 실행 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-MCP-DEV-01 | 공개 Node 서버에서 미구성 도구를 호출합니다. | 조회를 시작하지 않습니다. | [자동 검사](../../apps/mcp-server/test/public-server.test.ts) |
| TC-MCP-DEV-02 | 코드를 승인하고 Chrome 등록을 수령합니다. | 발급한 연결 키로 해당 채널만 조회할 수 있습니다. | [등록과 통합 검사](../../apps/mcp-server/test/shared-remote.test.ts) |
| TC-MCP-DEV-03 | 공개 압축에 허용하지 않은 경로를 넣습니다. | 산출물 검사가 실패합니다. | [패키지 검사](../../scripts/verifyPublicArtifact.test.ts) |
