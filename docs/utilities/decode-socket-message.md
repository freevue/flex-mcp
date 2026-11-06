# decode

[서버 함수 목록](../mcp/functions.md) · [구현](../../apps/mcp-server/src/remote/browserSocket.ts)

Node 소켓 내부 함수입니다. 텍스트 Buffer의 JSON을 읽습니다. 바이너리, 다른 형식과 잘못된 JSON은 undefined입니다.

```typescript
declare function decode(data: RawData, binary: boolean): unknown;
```

| 매개변수 | 타입 | 설명 |
| --- | --- | --- |
| `data` | `RawData` | 소켓이 받은 메시지입니다. |
| `binary` | `boolean` | 바이너리 메시지 여부입니다. |

| TC | 입력과 조건 | 기대 결과 | 확인 범위 |
| --- | --- | --- | --- |
| TC-U-DECODE-SOCKET-MESSAGE-01 | 텍스트 JSON, 바이너리와 잘못된 JSON을 각각 보냅니다. | 텍스트 JSON만 해석합니다. | 직접 자동 검사 예정 |
