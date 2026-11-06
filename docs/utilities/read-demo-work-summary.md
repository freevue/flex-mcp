# readDemoWorkSummary

[유틸 목록](../../UTILITIES.md) · [근무 요약](../features/extension-work-summary.md)

합성 Flex 조회의 세 범위를 읽고 팝업 근무 요약을 만듭니다. 연결이 다르거나 자료를 읽을 수 없으면 `null`을 반환합니다.

```typescript
declare function readDemoWorkSummary(
  bindingId: string,
  signal: AbortSignal,
  now?: Date,
): Promise<PopupWorkSummary | null>;
```

| 매개변수 | 설명 |
| --- | --- |
| `bindingId` | 현재 확장의 등록 ID입니다. |
| `signal` | 조회를 멈추는 신호입니다. |
| `now` | 선택입니다. 집계의 기준 시각입니다. 기본값은 현재 시각입니다. |

| TC | 조건 | 기대 결과 |
| --- | --- | --- |
| TC-U-DEMO-SUMMARY-01 | 2026년 11월 18일의 예시를 읽습니다. | 오늘 5시간 20분, 이번 달 실제 92시간, 오늘 기준 70시간과 54시간을 반환합니다. 예시 예정 연차가 0시간이므로 예상치도 같습니다. |

[자동 검사](../../apps/chrome-extension/test/work-summary.test.ts)에서 확인합니다.
