# MCP 서버 개발 문서

[서버 실행 안내](../../apps/mcp-server/README.md) · [개발 명령](development.md) · [서버 함수 목록](functions.md) · [Cloudflare Workers 배포 설계](cloudflare-workers.md) · [검증과 배포 절차](workers-release.md) · [Workers 합성 검증 구현](worker-implementation.md)

MCP 도구는 클라이언트가 이름과 인자로 실행하는 함수입니다. 이 문서는 도구가 받는 인자, 반환 필드, 호출하는 함수와 테스트를 연결합니다.

| 도구 | 공개 Node `stdio` | 원격 Node 합성 | 본인 PC MCP | Workers 합성 |
| --- | --- | --- | --- | --- |
| [`flex_get_annual_leave`](tools/flex-get-annual-leave.md) | 입력 검사 | 합성 조회 | 실계정 조회 | 로컬 검증 |
| [`flex_get_schedule`](tools/flex-get-schedule.md) | 입력 검사 | 합성 조회 | 실계정 조회 | 로컬 검증 |
| [`flex_get_work_hours`](tools/flex-get-work-hours.md) | 입력 검사 | 합성 조회 | 실계정 조회 | 로컬 검증 |
| [`flex_get_socket_status`](tools/flex-get-socket-status.md) | 입력 검사 | 본인 소켓 조회 | 제공하지 않음 | 로컬 검증 |
| [`flex_approve_connection`](tools/flex-approve-connection.md) | 입력 검사 | 일회용 코드 승인 | 제공하지 않음 | 로컬 검증 |
| [`flex_get_work_summary`](tools/flex-get-work-summary.md) | 제공하지 않음 | 제공하지 않음 | 실계정과 놀수 요약 | 신규 연결 예정 |

`stdio`는 로컬 프로세스의 표준 입출력입니다. 공개 `stdio`는 유효한 호출에도 연결 미구성 오류를 반환합니다. 본인 PC MCP는 별도 로컬 실행 파일입니다. 공개 Node 원격 서버는 합성 조회 성공 결과에 `synthetic: true`를 붙입니다. Workers 빌드도 합성 결과만 반환합니다. 원격 조회와 소켓 상태에는 승인에서 받은 `connectionKey`가 필요합니다. 합성 모드를 끈 공개 확장은 실제 결과를 반환하지 않습니다.

TC는 테스트 케이스입니다. `TC-MCP`는 도구 호출, `TC-U`는 함수, `TC-W`는 Workers를 확인합니다. 자동 테스트, 실계정 로컬 확인과 배포 검증을 구분합니다.
