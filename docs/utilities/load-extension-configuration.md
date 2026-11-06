# loadExtensionConfiguration

[유틸 목록](../../UTILITIES.md)

확장은 패키지에 있는 서버 주소와 합성 모드 설정을 읽습니다.

구현 위치: `apps/chrome-extension/src/extensionConfiguration.ts`

```typescript
declare function loadExtensionConfiguration(): Promise<ExtensionConfiguration>;
```

이 함수는 매개변수가 없습니다.

확인할 경우: 잘못된 주소나 설정은 사용하지 않습니다.
