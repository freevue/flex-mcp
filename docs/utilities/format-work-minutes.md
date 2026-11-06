# formatWorkMinutes

[유틸 목록](../../UTILITIES.md)

분을 시와 분으로 표시합니다.

구현 위치: `apps/chrome-extension/src/popup/formatWorkMinutes.ts`

```typescript
declare function formatWorkMinutes(minutes: number | null): string;
```

| 매개변수 | 설명 |
| --- | --- |
| `minutes` | 분 단위 값 또는 값 없음 |

확인할 경우: 값이 없으면 계산 정보가 없다고 표시합니다.
