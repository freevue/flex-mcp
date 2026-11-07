---
name: renderUnavailablePopup
type: unit
module: popup
issues: [22]
code: [apps/chrome-extension/src/popup/components.ts]
---

# renderUnavailablePopup

MCP가 연결되기 전의 팝업 내용을 만듭니다.

## 시그니처

<!-- prettier-ignore -->
```typescript
export function renderUnavailablePopup(snapshot: Exclude<PopupSnapshot, { kind: "connected" }>): HTMLElement[]
```

| 매개변수 | 타입                                            | 기본값 | 의미                                                                                                           |
| -------- | ----------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------- |
| snapshot | `Exclude<PopupSnapshot, { kind: "connected" }>` | 없음   | 오류 또는 연결되지 않은 상태입니다. 연결되지 않은 상태에는 코드, 재연결 가능 여부와 Flex 필요 여부가 있습니다. |

| 반환          | 의미                                |
| ------------- | ----------------------------------- |
| HTMLElement[] | 표시 순서로 정렬한 팝업 요소입니다. |

## 내부 로직

1. 오류 상태이면 연결 확인 실패, 설명, 다시 확인 버튼을 반환합니다.
2. 재연결할 수 없고 코드가 있으면 승인 대기 영역만 반환합니다.
3. 그 외에는 연결 화면과 소켓 미연결 안내를 표시합니다.
4. Flex 로그인이 필요하고 코드가 없으면 로그인 안내를 추가합니다.
5. 코드가 있으면 승인 대기 영역을 넣습니다. 코드가 없으면 일회용 코드 발급 버튼을 넣습니다.
6. 재연결할 수 있으면 다시 연결 버튼을 추가합니다.

## 사용법

```typescript
const nodes = renderUnavailablePopup({ kind: "error" });
```

## 사용처

| 위치                                                        | 용도                                      |
| ----------------------------------------------------------- | ----------------------------------------- |
| [갈피 근무 대시보드](../../feature/galpi-work-dashboard.md) | MCP가 연결되기 전의 팝업 내용을 만듭니다. |

## TC

| ID                           | 입력                                   | 기대 결과                                     |
| ---------------------------- | -------------------------------------- | --------------------------------------------- |
| UT-renderUnavailablePopup-01 | `kind`가 `error`입니다.                | 연결 확인 실패와 다시 확인 버튼을 표시합니다. |
| UT-renderUnavailablePopup-02 | 재연결할 수 없고 승인 코드가 있습니다. | 승인 대기 영역만 표시합니다.                  |
