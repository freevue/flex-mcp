# pairBrowser

[유틸 목록](../../UTILITIES.md) · [공유 연결 흐름](../features/shared-connection-flow.md)

선택한 서버에서 등록 ID와 확장 키를 받습니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/chrome-extension/src/registration/bridgeApi.ts` |
| 상태 | 현재 합성 빌드에서 사용 |

이 함수는 호환 API에서 운영자가 발급한 코드를 씁니다. 팝업은 [별도 승인 방식](../features/browser-pairing.md)을 사용합니다.

## 함수 계약

```typescript
declare function pairBrowser(origin: string, code: string): Promise<StoredRegistration>;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `origin` | `string` | 사용자가 승인한 서버 주소입니다. |
| `code` | `string` | 운영자가 발급한 일회용 코드입니다. |

## 확인할 경우

`TC-U-PAIR-BROWSER-01`: 정상 등록 응답만 저장할 수 있습니다. 다른 주소로 이동하는 응답은 거부합니다. [직접 검증 절차](../features/shared-connection-check.md)에서 연결 흐름도 확인합니다.
