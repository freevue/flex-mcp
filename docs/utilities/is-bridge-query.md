# isBridgeQuery

[중계 계약](../features/remote-bridge.md) · [구현](../../shared/validation.ts)

`isBridgeQuery(value: unknown): value is BridgeQuery`는 조회 종류와 기간을 검사합니다. `value`는 아직 확인하지 않은 요청입니다. `summary`는 `kind` 하나만 받습니다.

| TC                      | 입력                                    | 기대 결과   |
| ----------------------- | --------------------------------------- | ----------- |
| TC-U-IS-BRIDGE-QUERY-01 | `{ kind: "summary" }`                   | 통과합니다. |
| TC-U-IS-BRIDGE-QUERY-02 | 요약 요청에 계정이나 기간을 추가합니다. | 거부합니다. |

[요청 검사 테스트](../../apps/chrome-extension/test/bridge.test.ts)에서 확인합니다.
