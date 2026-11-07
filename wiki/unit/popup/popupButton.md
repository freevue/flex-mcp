---
name: popupButton
type: unit
module: popup
issues: [22]
code: [apps/chrome-extension/src/popup/components.ts]
---

# popupButton

팝업에서 실행할 동작을 가진 버튼을 만듭니다.

## 시그니처

<!-- prettier-ignore -->
```typescript
export function popupButton(label: string, action: PopupCommand | "copy", secondary = false): HTMLButtonElement
```

| 매개변수  | 타입                     | 기본값  | 의미                                     |
| --------- | ------------------------ | ------- | ---------------------------------------- |
| label     | `string`                 | 없음    | 버튼에 표시할 문구입니다.                |
| action    | `PopupCommand \| "copy"` | 없음    | 팝업 요청 또는 클립보드 복사 동작입니다. |
| secondary | 추론: boolean            | `false` | 보조 버튼 모양을 적용할지 정합니다.      |

| 반환              | 의미                                    |
| ----------------- | --------------------------------------- |
| HTMLButtonElement | 클릭과 키보드 조작이 가능한 버튼입니다. |

## 내부 로직

1. 기본 버튼 요소를 만들고 제출하지 않는 버튼으로 설정합니다.
2. 문구를 표시하고 동작 이름을 `data-action`에 넣습니다.
3. 보조 버튼이면 `secondary` 클래스를 넣습니다.

## 사용법

```typescript
const retry = popupButton("다시 확인", "popup-state", true);
```

## 사용처

| 위치                                                        | 용도                                         |
| ----------------------------------------------------------- | -------------------------------------------- |
| [갈피 근무 대시보드](../../feature/galpi-work-dashboard.md) | 팝업에서 실행할 동작을 가진 버튼을 만듭니다. |

## TC

| ID                | 입력                                                      | 기대 결과                                                 |
| ----------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| UT-popupButton-01 | 문구 다시 확인, 동작 `popup-state`, 보조 버튼 설정입니다. | 다시 확인 문구와 같은 동작을 가진 보조 버튼을 반환합니다. |
