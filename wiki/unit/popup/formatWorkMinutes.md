---
name: formatWorkMinutes
type: unit
module: popup
issues: [22]
code: [apps/chrome-extension/src/popup/formatWorkMinutes.ts]
---

# formatWorkMinutes

분 단위의 근무 시간을 화면 문구로 바꿉니다.

## 시그니처

```typescript
export function formatWorkMinutes(minutes: number | null): string;
```

| 매개변수 | 타입             | 기본값 | 의미                                                        |
| -------- | ---------------- | ------ | ----------------------------------------------------------- |
| minutes  | `number \| null` | 없음   | 0 이상의 정수 분 또는 계산할 정보가 없다는 뜻의 null입니다. |

| 반환   | 의미                           |
| ------ | ------------------------------ |
| string | 시간과 분을 표시한 문구입니다. |

## 내부 로직

1. 값이 null이면 계산 정보 없음을 반환합니다.
2. 60으로 나눈 몫으로 시간 수를 구합니다.
3. 나머지가 있으면 분도 표시합니다. 나머지가 0이면 시간만 표시합니다.

## 사용법

```typescript
const text = formatWorkMinutes(320);
```

## 사용처

| 위치                                                        | 용도                                        |
| ----------------------------------------------------------- | ------------------------------------------- |
| [갈피 근무 대시보드](../../feature/galpi-work-dashboard.md) | 분 단위의 근무 시간을 화면 문구로 바꿉니다. |

## TC

| ID                      | 입력                | 기대 결과                    |
| ----------------------- | ------------------- | ---------------------------- |
| UT-formatWorkMinutes-01 | 320분을 전달합니다. | 5시간 20분을 반환합니다.     |
| UT-formatWorkMinutes-02 | 0분을 전달합니다.   | 0시간을 반환합니다.          |
| UT-formatWorkMinutes-03 | null을 전달합니다.  | 계산 정보 없음을 반환합니다. |
