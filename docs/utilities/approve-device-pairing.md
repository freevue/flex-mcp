# approveDevicePairing

[Chrome 등록](../features/browser-pairing.md) · [투두 17](https://github.com/freevue/flex-mcp/issues/17)

유효한 일회용 코드를 승인합니다. 연결 키를 발급하고 해시만 저장합니다.

```typescript
declare function approveDevicePairing(database: StateDatabase, code: string, now?: number): string | null;
```

| 매개변수 | 설명 |
| --- | --- |
| `database` | 등록 저장소입니다. |
| `code` | Chrome 팝업의 일회용 코드입니다. |
| `now` | 선택입니다. 밀리초 시각입니다. |

| TC | 조건 | 기대 결과 |
| --- | --- | --- |
| TC-U-APPROVE-DEVICE-PAIRING-01 | 같은 코드로 두 번 승인합니다. | 첫 요청에만 연결 키를 반환합니다. |
