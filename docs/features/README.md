# flex MCP 기능 목록

이 목록은 [서비스 정책](../../SERVICE_POLICY.md)을 구현할 문서를 연결합니다. 서버 도구와 함수는 [MCP 개발 문서](../mcp/README.md)에서 찾습니다. 각 문서에서 기능의 입력, 결과, 테스트 케이스를 확인합니다. 투두의 상태는 GitHub에서 관리합니다.

`TC-F`는 기능의 여러 단계가 함께 동작하는지 확인하는 케이스입니다. 정책 검토, 합성 연결, Chrome, 운영, 배포 검증은 따로 기록합니다. 함수 하나의 입력과 결과는 [유틸 테스트 케이스](../../UTILITIES.md)에서 확인합니다.

| 투두                                                | 기능 문서                                                                                                    | 선행 작업                                       |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| [7](https://github.com/freevue/flex-mcp/issues/7)   | [실조회 방식과 공개 범위](reading-boundary.md)                                                               | 기반 구성과 유틸 계약                           |
| [3](https://github.com/freevue/flex-mcp/issues/3)   | [내 연차 조회](annual-leave.md)                                                                              | 실조회 방식 결정                                |
| [8](https://github.com/freevue/flex-mcp/issues/8)   | [에이전트와 프로필 접근 권한](access-control.md)                                                             | 유틸 계약, 실계정 검증은 투두 7                 |
| [4](https://github.com/freevue/flex-mcp/issues/4)   | [원격 MCP와 확장 중계](remote-bridge.md)                                                                     | 연차 조회와 접근 권한                           |
| [5](https://github.com/freevue/flex-mcp/issues/5)   | [내 일정 조회](schedule.md), [내 근무 시간 조회](work-hours.md), [확장 근무 요약](extension-work-summary.md) | 원격 중계와 실조회 방식                         |
| [9](https://github.com/freevue/flex-mcp/issues/9)   | [확장 연결과 복구 안내](extension-setup.md)                                                                  | 원격 중계와 접근 권한                           |
| [10](https://github.com/freevue/flex-mcp/issues/10) | [Git 훅과 Chrome 확장 릴리스](ci-artifacts.md)                                                               | 기반 구성                                       |
| [11](https://github.com/freevue/flex-mcp/issues/11) | [원격 운영과 복구](remote-operations.md), [Chrome 소켓 상태 조회](socket-status.md)                          | 원격 중계와 접근 권한                           |
| [6](https://github.com/freevue/flex-mcp/issues/6)   | [최종 배포 검증](release-verification.md)                                                                    | 일정·근무 조회, 확장 안내, 자동 검사, 운영 준비 |

실조회 방식과 자동 검사는 따로 진행할 수 있습니다. 접근 권한과 중계의 거부 조건은 합성 데이터로 먼저 확인할 수 있습니다. 실제 조회는 허용 범위를 정한 뒤 연차 한 건부터 확인합니다.

[공유 연결 흐름](shared-connection-flow.md)은 [투두 12](https://github.com/freevue/flex-mcp/issues/12)의 등록, 인증과 사용자별 요청 경로를 설명합니다. [Chrome 등록](browser-pairing.md)에서 확장과 MCP 클라이언트의 승인 흐름을 확인합니다. [팝업과 MCP 승인](extension-ui-plan.md)과 [현재 빌드 검증](shared-connection-check.md)은 별도로 기록합니다.
