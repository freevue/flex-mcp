# parseBridgeOrigin

[유틸 목록](../../UTILITIES.md) · [공유 연결 흐름](../features/shared-connection-flow.md)

서버의 HTTPS 주소나 로컬 검증 주소를 읽습니다.

| 항목 | 내용 |
| --- | --- |
| 구현 위치 | `shared/bridgeOrigin.ts` |
| 상태 | 계약 |

## 함수 계약

```typescript
declare function parseBridgeOrigin(value: string): URL | null;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `value` | `string` | 입력한 서버 주소입니다. |

## 확인할 경우

다른 프로토콜과 경로, 쿼리, 계정 정보가 든 주소를 거부합니다. [직접 검증 절차](../features/shared-connection-check.md)에서 연결 흐름도 확인합니다.
