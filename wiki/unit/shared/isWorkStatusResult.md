---
name: isWorkStatusResult
type: unit
module: shared
issues: [26]
code: [shared/workStatus.ts]
---

# isWorkStatusResult

근무 상태 응답의 필드와 값을 검사합니다.

## 시그니처

<!-- prettier-ignore -->
```typescript
export function isWorkStatusResult(value: unknown): value is WorkStatusResult
```

| 매개변수 | 타입      | 기본값 | 의미                               |
| -------- | --------- | ------ | ---------------------------------- |
| value    | `unknown` | 없음   | 브라우저나 확장에서 받은 값입니다. |

| 반환                        | 의미                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------- |
| `value is WorkStatusResult` | 값이 [근무 상태 결과](../../type/shared/WorkStatusResult.md)와 일치하는지 나타냅니다. |

## 내부 로직

1. 배열과 null을 제외한 객체인지 확인합니다. 키가 status 하나가 아니면 거짓을 반환합니다.
2. status가 명세의 문자열 네 개 중 하나이면 참을 반환합니다. 그 밖에는 거짓을 반환합니다.

## 사용법

```typescript
isWorkStatusResult({ status: "working" });
```

## 사용처

| 위치                                                | 용도                                       |
| --------------------------------------------------- | ------------------------------------------ |
| [본인 근무 상태](../../feature/flex-work-status.md) | 브리지 응답과 상태 읽기 결과를 검증합니다. |

## TC

| ID                       | 조건                                                      | 기대 결과                |
| ------------------------ | --------------------------------------------------------- | ------------------------ |
| UT-isWorkStatusResult-01 | 네 가지 상태와 잘못된 상태, 추가 필드, 누락을 입력합니다. | 네 가지 상태만 참입니다. |
