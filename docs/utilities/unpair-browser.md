# unpairBrowser

[유틸 목록](../../UTILITIES.md) · [공유 연결 흐름](../features/shared-connection-flow.md)

서버의 현재 등록을 해제합니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `apps/chrome-extension/src/registration/bridgeApi.ts` |
| 상태 | 구현 |

## 함수 계약

```typescript
declare function unpairBrowser(registration: StoredRegistration): Promise<void>;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `registration` | `StoredRegistration` | 확장에 저장한 서버 주소, 등록 ID와 확장 키입니다. |

## 확인할 경우

`TC-U-UNPAIR-BROWSER-01`: 서버가 해제를 확인한 뒤에만 로컬 등록을 지울 수 있습니다. [직접 검증 절차](../features/shared-connection-check.md)에서 연결 흐름도 확인합니다.
