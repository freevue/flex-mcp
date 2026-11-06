# MCP 서버 개발 도구

[도구 목록](README.md) · [서버 실행 안내](../../apps/mcp-server/README.md) · [Workers 배포 절차](workers-release.md)

현재 개발 도구는 Node 서버와 Chrome 확장을 검사합니다. Workers 검증 빌드는 저장소 루트의 Wrangler 설정을 사용합니다.

| 명령 | 입력과 동작 | 함수와 결과 |
| --- | --- | --- |
| `pnpm check` | 저장소 루트에서 실행합니다. 스크립트와 두 앱의 타입을 확인합니다. | 각 앱의 TypeScript 설정을 사용합니다. |
| `pnpm check:worker` | Worker의 타입만 확인합니다. | Worker 진입점과 저장소 어댑터를 검사합니다. |
| `pnpm build:worker` | 운영 설정으로 번들을 만듭니다. | Wrangler 모의 실행입니다. 배포하지 않습니다. |
| `pnpm flex:worker-agent <ownerId> [--approve]` | 합성 검증용 사용자와 선택 승인 권한을 지정합니다. | 키 원문과 Worker에 설정할 키 해시 정보를 따로 반환합니다. |
| `pnpm test` | 저장소 루트에서 실행합니다. 자동 검사에 합성 자료를 사용합니다. | 도구, 등록, 소켓 중계와 공개 압축 검사 결과를 냅니다. |
| `pnpm build:mcp` | 저장소 루트에서 실행합니다. Node 서버를 빌드합니다. | `apps/mcp-server/dist/index.js`를 만듭니다. |
| `pnpm package:public` | 저장소 루트에서 실행합니다. 서버와 확장을 각각 포장합니다. | [verifyPublicArtifact](../utilities/verify-public-artifact.md)가 필수 파일과 허용 범위를 검사합니다. |
| `pnpm flex:remote` | 로컬 상태 파일, 공개 주소와 허용한 확장 ID를 설정합니다. | [openStateDatabase](../utilities/open-state-database.md)와 [createRemoteServer](../utilities/create-remote-server.md)를 실행합니다. |
| `pnpm flex:admin agent <ownerId>` | 운영자가 검증 환경의 사용자 ID를 지정합니다. | [issueAgentKey](../utilities/issue-agent-key.md)가 조회 전용 키를 발급합니다. |
| `pnpm flex:admin agent-approve <ownerId>` | 운영자가 승인할 사용자 ID를 지정합니다. | 같은 함수가 연결 승인 권한을 포함한 키를 발급합니다. |
| `pnpm flex:admin pair <ownerId>` | 기존 등록 방식의 사용자 ID를 지정합니다. | [issuePairingCode](../utilities/issue-pairing-code.md)를 실행합니다. 새 팝업의 승인 방식은 이 명령을 사용하지 않습니다. |
| `pnpm flex:admin revoke-agent <callerId>` | 회수할 에이전트 ID를 지정합니다. | [removeCaller](../utilities/remove-caller.md)가 호출 권한을 지웁니다. |
| `pnpm flex:admin revoke-browser <ownerId>` | 해제할 사용자 ID를 지정합니다. | 그 사용자의 기존 등록과 승인 대기 자료를 지웁니다. |
| `pnpm --filter @flex-mcp/server run demo:query` | `FLEX_PUBLIC_URL`과 사용자 키를 설정한 뒤 실행합니다. | 원격 Node 서버의 [일정 도구](tools/flex-get-schedule.md)를 호출합니다. |

환경 변수 설정과 두 프로필 검증 순서는 [합성 검증 절차](../features/shared-connection-check.md)를 따릅니다. 키 원문을 공유 로그나 공개 문서에 붙이지 않습니다. 원격 서버와 운영 명령은 같은 `FLEX_STATE_FILE`을 사용합니다.

| TC | 실행 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-MCP-DEV-01 | 공개 Node 서버에서 미구성 도구를 호출합니다. | 조회를 시작하지 않습니다. | [자동 검사](../../apps/mcp-server/test/public-server.test.ts) |
| TC-MCP-DEV-02 | 합성 환경에서 조회 전용 키와 승인 키를 발급합니다. | 승인 권한이 있는 키만 코드를 승인합니다. | [등록과 통합 검사](../../apps/mcp-server/test/shared-remote.test.ts) |
| TC-MCP-DEV-03 | 공개 압축에 허용하지 않은 경로를 넣습니다. | 산출물 검사가 실패합니다. | [패키지 검사](../../scripts/verifyPublicArtifact.test.ts) |
