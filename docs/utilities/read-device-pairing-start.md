# readDevicePairingStart

[유틸 목록](../../UTILITIES.md) · [최초 등록](../features/browser-pairing.md)

서버 응답과 Chrome 세션 저장소에서 최초 등록에 필요한 값 세 개를 검사합니다. 유효하지 않은 값은 `null`을 반환합니다.

```typescript
declare function readDevicePairingStart(value: unknown): DevicePairingStart | null;
```

`value`는 검사할 값입니다. 승인 코드, 요청 키, 만료 시각을 포함합니다.

| TC | 조건 | 기대 결과 |
| --- | --- | --- |
| TC-U-READ-PAIR-START-01 | 세 값의 형식이 맞습니다. | 등록 요청을 반환합니다. |
| TC-U-READ-PAIR-START-02 | 키가 없거나 다른 필드가 들어옵니다. | `null`을 반환합니다. |
