# readAccount

[유틸 목록](../../UTILITIES.md) · [Chrome 등록](../features/browser-pairing.md)

확장 저장소의 값에서 해당 등록 또는 승인 요청에 묶인 Flex 계정 비교 값을 읽습니다. 값은 팝업이나 서버에 보내지 않습니다.

```typescript
declare function readAccount(value: unknown, binding: string): string | undefined;
```

| 매개변수 | 설명 |
| --- | --- |
| `value` | 확장 저장소에서 읽은 값입니다. |
| `binding` | 조회할 등록 ID 또는 승인 요청 키입니다. |

| TC | 조건 | 기대 결과 |
| --- | --- | --- |
| TC-U-READ-ACCOUNT-01 | 저장한 값이 지정한 등록에 속하며 계정 비교 값이 유효합니다. | 계정 비교 값만 반환합니다. |
| TC-U-READ-ACCOUNT-02 | 저장한 값이 다른 등록에 속하거나 계정 비교 값의 형식이 틀립니다. | `undefined`를 반환합니다. |
