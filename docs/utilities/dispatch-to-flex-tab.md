# dispatchToFlexTab

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/remote-bridge.md) · [공통 타입](../UTILITY_TYPES.md)

확장에 포함된 조회 코드를 선택한 flex 탭에서 실행합니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/chrome-extension/src/bridge/dispatchToFlexTab.ts` |
| 상태 | 구현 |
| 출력 | 같은 탭과 연결에서 나온 도구 결과 또는 오류입니다. |
| 실패 | 탭이 닫히거나 주소가 바뀌면 이전 결과를 폐기합니다. 요청이 실행 코드를 지정할 수 없습니다. |

## 함수 계약

```typescript
declare function dispatchToFlexTab(tab: FlexTab, request: BridgeRequest, signal: AbortSignal, runtime: TabRuntime): Promise<BridgeReply>;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `tab` | `FlexTab` | 필수 | 주소와 대상을 확인한 flex 탭입니다. |
| `request` | `BridgeRequest` | 필수 | 요청 ID와 조회 내용을 검사한 메시지입니다. |
| `signal` | `AbortSignal` | 필수 | 탭 호출이 더 이상 유효하지 않을 때 쓰는 신호입니다. |
| `runtime` | `TabRuntime` | 필수 | 선택한 탭의 문서를 확인하고 해당 문서에서 확장에 포함된 조회를 실행합니다. |

## 테스트 케이스

아래 조건에서 `dispatchToFlexTab`을 호출합니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-DISPATCH-TO-FLEX-TAB-01 | 선택한 탭이 조회 전후에 같은 문서를 표시합니다. | 패키지에 있는 조회 함수만 실행합니다. 같은 요청 ID로 결과를 반환합니다. | [로컬 테스트](../../apps/mcp-server/test/query-integration.test.ts) |
| TC-U-DISPATCH-TO-FLEX-TAB-02 | 응답 전에 탭이 닫히거나 다른 페이지로 이동합니다. | 이전 결과를 폐기합니다. `FLEX_TAB_UNAVAILABLE`을 반환합니다. | [로컬 테스트](../../apps/chrome-extension/test/bridge.test.ts) |
| TC-U-DISPATCH-TO-FLEX-TAB-03 | 서버가 요청을 중단한 뒤 탭에서 응답이 도착합니다. | `FLEX_READ_FAILED`를 담은 실패 응답을 반환합니다. 조회 결과는 담지 않습니다. | [로컬 테스트](../../apps/chrome-extension/test/bridge.test.ts) |
