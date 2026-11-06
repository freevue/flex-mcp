# reconcileBrowserAccess

[유틸 목록](../../UTILITIES.md) · [공유 연결 흐름](../features/shared-connection-flow.md)

현재 권한을 다시 읽고 해제한 연결과 대기 요청을 종료합니다.

구현 위치: `apps/mcp-server/src/remote/browserSocket.ts`

```typescript
declare function reconcileBrowserAccess(relay: RelayContext): void;
```

`relay`는 현재 권한, 대기 요청과 활성 소켓을 담습니다.

`TC-U-RECONCILE-BROWSER-ACCESS-01`: 한 사용자를 해제해도 다른 사용자의 소켓과 조회가 유지됩니다.
