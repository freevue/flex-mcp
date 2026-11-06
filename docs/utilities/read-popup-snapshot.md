# readPopupSnapshot

[유틸 목록](../../UTILITIES.md)

팝업은 작업자가 보낸 표시용 값을 확인합니다.

구현 위치: `apps/chrome-extension/src/popup/readPopupSnapshot.ts`

```typescript
declare function readPopupSnapshot(value: unknown): PopupSnapshot | null;
```

| 매개변수 | 설명 |
| --- | --- |
| `value` | 서비스 워커가 보낸 응답 |

확인할 경우: 등록 키가 포함된 응답은 받지 않습니다.
