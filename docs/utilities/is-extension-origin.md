# isExtensionOrigin

[Chrome 등록](../features/browser-pairing.md) · [투두 17](https://github.com/freevue/flex-mcp/issues/17)

Chrome 확장 출처의 형식을 확인합니다. 출처를 인증 자료로 사용하지 않습니다.

```typescript
declare function isExtensionOrigin(value: string | null | undefined): boolean;
```

| 매개변수 | 설명 |
| --- | --- |
| `value` | 브라우저의 Origin 헤더입니다. |

| TC | 조건 | 기대 결과 |
| --- | --- | --- |
| TC-U-IS-EXTENSION-ORIGIN-01 | 웹사이트 출처와 Chrome 확장 출처를 각각 보냅니다. | Chrome 확장 출처 형식만 허용합니다. |
