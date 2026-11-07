---
name: renderConnectionRows
type: unit
module: popup
issues: [22]
code: [apps/chrome-extension/src/popup/components.ts]
---

# renderConnectionRows

연결된 팝업에 MCP와 Flex 상태를 표시합니다.

## 시그니처

<!-- prettier-ignore -->
```typescript
export function renderConnectionRows(flex: Extract<PopupSnapshot, { kind: "connected" }>["flex"]): HTMLDListElement
```

| 매개변수 | 타입                                                    | 기본값 | 의미                                                                         |
| -------- | ------------------------------------------------------- | ------ | ---------------------------------------------------------------------------- |
| flex     | `Extract<PopupSnapshot, { kind: "connected" }>["flex"]` | 없음   | Flex 실제 연결 `live`, 합성 `synthetic`, 미연결 `unavailable` 중 하나입니다. |

| 반환             | 의미                                       |
| ---------------- | ------------------------------------------ |
| HTMLDListElement | 연결 상태라는 이름을 가진 설명 목록입니다. |

## 내부 로직

1. 첫 항목에 MCP 연결됨을 표시합니다.
2. 둘째 항목은 Flex입니다. 실제 연결이면 연결됨을 표시합니다. 합성 모드이면 합성 모드를 표시합니다. 나머지는 미연결을 표시합니다.
3. 연결 상태 문구에 맞춰 연결 또는 주의 색을 적용합니다.

## 사용법

```typescript
const rows = renderConnectionRows("synthetic");
```

## 사용처

| 위치                                                        | 용도                                        |
| ----------------------------------------------------------- | ------------------------------------------- |
| [갈피 근무 대시보드](../../feature/galpi-work-dashboard.md) | 연결된 팝업에 MCP와 Flex 상태를 표시합니다. |

## TC

| ID                         | 입력                        | 기대 결과                                      |
| -------------------------- | --------------------------- | ---------------------------------------------- |
| UT-renderConnectionRows-01 | `synthetic`을 전달합니다.   | MCP 연결됨 다음에 Flex 합성 모드를 표시합니다. |
| UT-renderConnectionRows-02 | `unavailable`을 전달합니다. | MCP는 연결됨이고 Flex는 미연결입니다.          |
