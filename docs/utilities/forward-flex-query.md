# forwardFlexQuery

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/remote-bridge.md) · [공통 타입](../UTILITY_TYPES.md)

조회 요청을 현재 확장에 보내고 해당 요청의 결과만 반환합니다.

| 항목      | 내용                                                                                                              |
| --------- | ----------------------------------------------------------------------------------------------------------------- |
| 구현 위치 | `apps/mcp-server/src/bridge/forwardFlexQuery.ts`                                                                  |
| 상태      | 구현                                                                                                              |
| 출력      | 요청 ID, 현재 연결, 대기 요청이 모두 같은 응답입니다. 결과를 보내기 전에 접근 권한을 다시 확인합니다.             |
| 실패      | 연결이 없거나 끊기면 `BROWSER_OFFLINE`입니다. 시간이 지나면 `QUERY_TIMEOUT`입니다. 시간이 지난 응답은 무시합니다. |

## 함수 계약

```typescript
declare function forwardFlexQuery(
  caller: AuthorizedCaller,
  query: BridgeQuery,
  context: RelayContext,
  markSynthetic?: boolean,
): Promise<Outcome<BridgeResult & { synthetic?: true }, RelayFailure>>;
```

| 매개변수        | 타입               | 필수 여부 | 설명                                                                                             |
| --------------- | ------------------ | --------- | ------------------------------------------------------------------------------------------------ |
| `caller`        | `AuthorizedCaller` | 필수      | 서버에서 접근 권한을 확인한 에이전트입니다.                                                      |
| `query`         | `BridgeQuery`      | 필수      | 도구 종류와 기간을 검사한 조회입니다.                                                            |
| `context`       | `RelayContext`     | 필수      | 현재 권한과 연결, 요청 ID, 대기 시간과 건수 제한을 확인할 서버 문맥입니다.                       |
| `markSynthetic` | `boolean`          | 선택      | 기본값은 false입니다. true이면 실조회 출처 표시가 없는 성공 결과에 `synthetic: true`를 붙입니다. |

## 테스트 케이스

아래 조건에서 `forwardFlexQuery`을 호출합니다.

| TC                         | 준비와 입력                                                                  | 기대 결과                                                        | 상태                                                               |
| -------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| TC-U-FORWARD-FLEX-QUERY-01 | 같은 프로필에서 두 요청이 대기 중입니다. 나중 요청의 응답이 먼저 도착합니다. | 요청마다 발급한 ID가 일치하는 결과만 원래 호출자에게 반환합니다. | [로컬 테스트](../../apps/mcp-server/test/relay.test.ts)            |
| TC-U-FORWARD-FLEX-QUERY-02 | 연결이 없거나 응답을 받기 전에 끊깁니다.                                     | `BROWSER_OFFLINE`을 반환합니다. 대기 항목을 제거합니다.          | [로컬 테스트](../../apps/mcp-server/test/relay.test.ts)            |
| TC-U-FORWARD-FLEX-QUERY-03 | 연결은 유지됐지만 시간 제한 뒤에 같은 요청의 응답이 옵니다.                  | `QUERY_TIMEOUT`을 반환합니다. 늦은 응답은 무시합니다.            | [로컬 테스트](../../apps/mcp-server/test/relay.test.ts)            |
| TC-U-FORWARD-FLEX-QUERY-04 | 다른 연결에서 같은 ID의 응답이 오거나 같은 응답이 두 번 도착합니다.          | 첫 유효 응답만 사용합니다. 다른 연결과 중복 응답은 폐기합니다.   | [로컬 테스트](../../apps/mcp-server/test/relay.test.ts)            |
| TC-U-FORWARD-FLEX-QUERY-05 | 응답을 보내기 전에 호출자의 권한을 회수합니다.                               | `ACCESS_DENIED`를 반환합니다. 조회 결과는 보내지 않습니다.       | [로컬 테스트](../../apps/mcp-server/test/relay.test.ts)            |
| TC-U-FORWARD-FLEX-QUERY-06 | 대기 건수 상한이 찬 상태에서 조회를 요청합니다.                              | `QUERY_LIMIT_REACHED`를 반환합니다. 새 조회를 전달하지 않습니다. | [로컬 테스트](../../apps/mcp-server/test/relay.test.ts)            |
| TC-U-FORWARD-FLEX-QUERY-07 | 출처 표시가 있는 응답과 없는 응답을 보냅니다.                                | 표시가 없는 원격 결과만 합성으로 표시합니다.                     | [원격 연결 검사](../../apps/mcp-server/test/shared-remote.test.ts) |
