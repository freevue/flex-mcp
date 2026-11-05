# attachBrowserBridge

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/remote-bridge.md) · [공통 타입](../UTILITY_TYPES.md)

허용된 확장 연결을 현재 프로필에 등록합니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/mcp-server/src/bridge/attachBrowserBridge.ts` |
| 상태 | 구현 |
| 출력 | 프로필에 등록된 현재 연결입니다. 연결마다 대기 요청을 구분합니다. |
| 실패 | 허용하지 않은 연결은 등록하지 않습니다. 연결을 바꾸면 기존 연결의 대기 요청을 종료합니다. |

## 함수 계약

```typescript
declare function attachBrowserBridge(binding: BrowserBinding, connection: BrowserConnection, registry: BridgeRegistry): Outcome<BrowserConnection, "ACCESS_DENIED">;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `binding` | `BrowserBinding` | 필수 | 서버가 허용한 프로필 연결 관계입니다. |
| `connection` | `BrowserConnection` | 필수 | 서버가 확인한 새 확장 연결입니다. |
| `registry` | `BridgeRegistry` | 필수 | 현재 연결과 대기 요청을 관리하는 서버 상태입니다. |

## 테스트 케이스

아래 조건에서 `attachBrowserBridge`을 호출합니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-ATTACH-BROWSER-BRIDGE-01 | 허용된 프로필의 첫 확장 연결을 등록합니다. | 새 연결을 해당 프로필의 현재 연결로 저장합니다. | [로컬 테스트](../../apps/mcp-server/test/relay.test.ts) |
| TC-U-ATTACH-BROWSER-BRIDGE-02 | 확장 연결이 등록 대상과 다른 프로필에 속합니다. | `ACCESS_DENIED`를 반환합니다. 현재 연결을 변경하지 않습니다. | [로컬 테스트](../../apps/mcp-server/test/relay.test.ts) |
| TC-U-ATTACH-BROWSER-BRIDGE-03 | 같은 프로필이 다시 연결됩니다. 기존 연결에 대기 요청이 있습니다. | 기존 대기 요청을 종료합니다. 이전 연결의 늦은 응답을 새 연결에 전달하지 않습니다. | [로컬 테스트](../../apps/mcp-server/test/relay.test.ts) |
