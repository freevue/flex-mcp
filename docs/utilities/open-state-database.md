# openStateDatabase

[유틸 목록](../../UTILITIES.md) · [공유 연결 흐름](../features/shared-connection-flow.md)

권한을 확인하고 등록과 키 해시를 저장할 SQLite 파일을 엽니다.

구현 위치: `apps/mcp-server/src/registration/database.ts`

```typescript
declare function openStateDatabase(file: string): DatabaseSync;
```

`file`은 운영자가 지정한 로컬 경로입니다. 합성 단위 검사에서는 `:memory:`를 사용할 수 있습니다.

`TC-U-OPEN-STATE-DATABASE-01`: 다른 사용자가 읽을 수 있는 기존 파일을 열지 않습니다.
