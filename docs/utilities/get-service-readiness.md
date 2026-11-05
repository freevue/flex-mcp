# getServiceReadiness

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/remote-operations.md) · [공통 타입](../UTILITY_TYPES.md)

서버가 새 요청을 받을 수 있는지 확인합니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/mcp-server/src/operations/getServiceReadiness.ts` |
| 상태 | 구현 |
| 출력 | 서버의 요청 수락 여부와 운영자용 브라우저 연결 여부입니다. 개인 결과는 반환하지 않습니다. |
| 실패 | 필수 설정이 빠지거나 서비스가 중단되면 조회를 허용하지 않습니다. 브라우저 오프라인은 서버가 꺼진 상태와 구분합니다. |

## 함수 계약

```typescript
declare function getServiceReadiness(settings: ServiceReadinessInput): ServiceReadiness;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `settings` | `ServiceReadinessInput` | 필수 | 필수 운영 설정, 중단 여부, 승인된 브라우저 연결 상태입니다. |

## 테스트 케이스

아래 조건에서 `getServiceReadiness`을 호출합니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-GET-SERVICE-READINESS-01 | 필수 설정이 있고 중단하지 않았으며 브라우저가 연결돼 있습니다. | `acceptsRequests`와 운영자용 `browserOnline`이 모두 참입니다. | 예정 |
| TC-U-GET-SERVICE-READINESS-02 | 서버가 정상이고 브라우저만 연결되지 않았습니다. | `acceptsRequests`는 참, `browserOnline`은 거짓입니다. 실제 조회 성공을 표시하지 않습니다. | [로컬 테스트](../../apps/mcp-server/test/relay.test.ts) |
| TC-U-GET-SERVICE-READINESS-03 | 브라우저는 연결됐지만 필수 서버 설정이 없습니다. | `acceptsRequests`는 거짓입니다. 운영 설정이나 개인 결과를 응답에 넣지 않습니다. | [로컬 테스트](../../apps/mcp-server/test/relay.test.ts) |
| TC-U-GET-SERVICE-READINESS-04 | 설정이 있지만 운영자가 서비스를 중단했습니다. | `acceptsRequests`는 거짓입니다. | [로컬 테스트](../../apps/mcp-server/test/relay.test.ts) |
