# 실조회 방식과 공개 범위

[투두 7](https://github.com/freevue/flex-mcp/issues/7) · [서비스 정책](../../SERVICE_POLICY.md)

세 도구가 요구하는 결과를 얻을 수 있는 경로를 정합니다. 공개 소스, 공개 산출물, 제한 배포 산출물을 구분합니다. 아래 표는 문서 조사 결과입니다. 회사 환경의 권한과 화면 일치는 아직 확인하지 않았습니다.

| 도구 | flex 공식 Open API에서 확인한 내용 | 첫 검증에서 확인할 내용 |
| --- | --- | --- |
| 연차 | [연차 조회](https://developers.flex.team/reference/user-time-off-buckets-get-user-annual-time-off-buckets-by-employee-numbers)에 잔여 일수와 분이 있습니다. | 잔여량과 사용 가능량이 각각 제공되는지 확인합니다. |
| 일정 | [공개 API 목록](https://developers.flex.team/llms.txt)에서 본인 기본 캘린더의 일반 일정 조회를 찾지 못했습니다. | 허용된 Chrome 탭에서 종일과 시간 지정 일정을 읽을 수 있는지 확인합니다. |
| 근무 시간 | [근무 스케줄 조회](https://developers.flex.team/reference/user-work-schedules-get-user-work-schedules-by-period-and-employee-numbers)는 일별 근무와 휴가 구간을 제공합니다. | 화면의 실제·인정·소정·연장근무 집계와 같은 결과를 얻는지 확인합니다. |

## 결정 절차

1. 회사 환경에서 허용한 조회 방식과 계정을 확인합니다. [Open API 이용 조건](https://developers.flex.team/reference/faq-limitation)도 확인합니다.
2. 허용된 방식에서 각 도구의 필수 결과를 확인합니다. 지원하지 않는 필드를 적습니다.
3. 산출물을 받을 대상과 전달 경로를 정합니다. Chrome Web Store를 선택하면 [사용자 데이터 정책](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)을 확인합니다.
4. 브라우저, 서버, MCP 클라이언트가 받거나 보관하는 값을 기록합니다. 공개 파일에 넣을 수 없는 항목을 확인합니다.

승인한 Chrome 방식이 도구 계약에 맞으면 [연차 조회](annual-leave.md) 한 건부터 진행합니다. 공식 Open API가 필요한 필드를 제공하면 해당 도구의 후보로 기록합니다. 운영 범위에 맞는 방식이 없으면 미연결 상태를 유지합니다. 공개 이슈에는 선택한 방식과 검증 결과만 남깁니다. 이 결정 작업에는 별도 유틸이 필요하지 않습니다.

## 테스트 케이스

기능의 여러 단계가 함께 동작하는지 확인합니다. 기존 테스트로 표시한 경우를 제외하면 모두 예정입니다.

| TC | 확인 범위 | 준비와 실행 | 기대 결과 |
| --- | --- | --- | --- |
| TC-F-READING-BOUNDARY-01 | 정책 검토 | 공식 API가 잔여량만 제공하는 경우에 연차 도구의 필수 필드와 대조합니다. | 사용 가능량을 추정하지 않습니다. 제공하지 않는 필드와 대안을 결정 기록에 남깁니다. |
| TC-F-READING-BOUNDARY-02 | 정책 검토 | 실계정 조회 방식과 제한 배포 대상이 아직 승인되지 않았습니다. 공개 서버를 확인합니다. | 실계정 조회와 제한 배포를 시작하지 않습니다. 공개 서버는 미연결 상태를 유지합니다. |
| TC-F-READING-BOUNDARY-03 | 산출물 검사 | 공개 산출물과 제한 배포 산출물의 허용 목록을 확인합니다. | 공개 파일에 내부 조회 경로와 실제 응답이 없습니다. 제한 배포 대상과 전송·보관 범위가 기록돼 있습니다. |
| TC-F-READING-BOUNDARY-04 | 정책 검토 | Chrome Web Store를 배포 경로로 선택한 경우를 검토합니다. | 사용자 데이터 처리 안내와 필요한 확장 권한을 확인할 항목으로 기록합니다. |
