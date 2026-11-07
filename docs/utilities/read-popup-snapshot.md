# readPopupSnapshot

[유틸 목록](../../UTILITIES.md)

팝업은 작업자가 보낸 표시용 값을 확인합니다.

구현 위치: `apps/chrome-extension/src/popup/readPopupSnapshot.ts`

```typescript
declare function readPopupSnapshot(value: unknown): PopupSnapshot | null;
```

| 매개변수 | 설명                    |
| -------- | ----------------------- |
| `value`  | 서비스 워커가 보낸 응답 |

확인할 경우: 등록 키가 포함된 응답은 받지 않습니다.

`TC-U-READ-POPUP-SNAPSHOT-02`: 연결 상태의 추가 승인 코드와 근무 요약을 함께 받습니다. 요청 키를 포함하면 응답을 거부합니다.

`TC-U-READ-POPUP-SNAPSHOT-03`: Flex를 미연결로 표시하는 응답에는 추가 승인 코드가 없어야 합니다.
