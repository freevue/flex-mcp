# createSyntheticReply

[유틸 목록](../../UTILITIES.md) · [공유 연결 흐름](../features/shared-connection-flow.md)

등록을 구분할 수 있는 합성 결과를 반환합니다.

구현 위치: `apps/chrome-extension/src/bridge/syntheticReply.ts`

```typescript
declare function createSyntheticReply(request: BridgeRequest, bindingId: string): BridgeReply;
```

`request`는 인증한 서버의 읽기 요청입니다. `bindingId`는 확장에 등록한 ID입니다. 일정 제목에 앞부분을 씁니다.

`TC-U-CREATE-SYNTHETIC-REPLY-01`: Flex에 접속하지 않고 일정 결과에 등록 ID 앞부분만 표시합니다.

[자동 검사](../../apps/mcp-server/test/shared-remote.test.ts)에서 관련 조건을 확인합니다.
