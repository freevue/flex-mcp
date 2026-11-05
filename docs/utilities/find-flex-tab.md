# findFlexTab

[유틸 목록](../../UTILITIES.md) · [기능 문서](../features/annual-leave.md) · [공통 타입](../UTILITY_TYPES.md)

연결한 Chrome 프로필에서 조회할 flex 탭을 찾습니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/chrome-extension/src/bridge/findFlexTab.ts` |
| 상태 | 구현 예정 |
| 출력 | 허용된 flex 탭 하나입니다. 여러 탭이 있으면 사용자가 고른 탭을 사용합니다. |
| 실패 | 조회할 탭이 없거나 대상을 한 탭으로 정할 수 없으면 `FLEX_TAB_UNAVAILABLE`을 반환합니다. |

## 함수 계약

```typescript
declare function findFlexTab(tabs: readonly TabCandidate[], selectedTabId?: number): Outcome<FlexTab, "FLEX_TAB_UNAVAILABLE">;
```

| 매개변수 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `tabs` | `readonly TabCandidate[]` | 필수 | 현재 Chrome 프로필에서 읽은 탭 목록입니다. |
| `selectedTabId` | `number` | 선택 | 사용자가 선택한 탭 ID입니다. 생략하면 조회 가능한 탭이 하나일 때만 그 탭을 사용합니다. |

## 테스트 케이스

아래 조건에서 `findFlexTab`을 호출합니다.

| TC | 준비와 입력 | 기대 결과 | 상태 |
| --- | --- | --- | --- |
| TC-U-FIND-FLEX-TAB-01 | 탭 목록에 다른 사이트 하나와 조회 가능한 flex 탭 하나가 있습니다. | flex 탭만 반환합니다. | 예정 |
| TC-U-FIND-FLEX-TAB-02 | 조회 가능한 flex 탭이 두 개이고 사용자가 탭 하나를 지정했습니다. | 지정한 탭을 반환합니다. | 예정 |
| TC-U-FIND-FLEX-TAB-03 | 조회 가능한 탭이 두 개이고 `selectedTabId`가 없습니다. | `FLEX_TAB_UNAVAILABLE`을 반환합니다. 임의로 고르지 않습니다. | 예정 |
| TC-U-FIND-FLEX-TAB-04 | 지정한 탭이 이미 닫혔거나 다른 사이트로 이동했습니다. | `FLEX_TAB_UNAVAILABLE`을 반환합니다. 다른 탭으로 바꾸지 않습니다. | 예정 |
