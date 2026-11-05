# deriveConnectionState

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/extension-setup.md) · [공통 타입](../UTILITY_TYPES.md)

연결과 조회 상태를 사용자가 확인할 수 있는 안내로 바꿉니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/chrome-extension/src/bridge/deriveConnectionState.ts` |
| 상태 | 구현 예정 |
| 출력 | [확장 상태 안내](../features/extension-setup.md)에 있는 상태와 다음 행동입니다. |
| 실패 | 확인하지 않은 상태를 조회 가능으로 표시하지 않습니다. 안내에 개인 결과나 접근 정보를 담지 않습니다. |

## 함수 계약

```typescript
declare function deriveConnectionState(snapshot: ConnectionSnapshot): ConnectionState;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `snapshot` | `ConnectionSnapshot` | 필수 | 연결 설정, 브라우저 연결, 마지막으로 확인한 flex 상태입니다. 연결이 바뀐 경우 이전 상태는 확인하지 않은 상태로 넣습니다. |

## 테스트 케이스

아래 조건에서 `deriveConnectionState`을 호출합니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-DERIVE-CONNECTION-STATE-01 | 프로필을 연결하지 않았습니다. | 연결되지 않음 상태와 연결 방법을 표시합니다. | 예정 |
| TC-U-DERIVE-CONNECTION-STATE-02 | 브라우저가 오프라인이고 지난 조회는 성공했습니다. | 브라우저 오프라인을 표시합니다. 이전 성공으로 조회 준비 상태를 표시하지 않습니다. | 예정 |
| TC-U-DERIVE-CONNECTION-STATE-03 | 서버 연결은 됐지만 현재 flex 상태를 확인하지 않았습니다. | 서버 연결됨과 flex 상태 미확인을 표시합니다. | 예정 |
| TC-U-DERIVE-CONNECTION-STATE-04 | flex가 다시 로그인을 요구하거나 현재 계정이 다릅니다. | 재로그인 필요와 계정 불일치를 각각 표시합니다. | 예정 |
| TC-U-DERIVE-CONNECTION-STATE-05 | 현재 연결에서 탭과 로그인, 계정을 확인했습니다. | 조회 준비 상태를 표시합니다. 계정 식별자나 조회 값은 표시하지 않습니다. | 예정 |
| TC-U-DERIVE-CONNECTION-STATE-06 | 연결과 계정은 유효하지만 flex 조회가 실패했습니다. | 조회 실패와 다음 확인 방법을 표시합니다. 재로그인 필요 상태로 바꾸지 않습니다. | 예정 |
