---
name: readLiveReply
type: unit
module: bridge
issues: [26]
code: [apps/chrome-extension/src/bridge/readLiveReply.ts]
---

# readLiveReply

승인한 계정의 Flex 읽기 결과를 브리지 응답으로 바꿉니다.

## 시그니처

<!-- prettier-ignore -->
```typescript
export async function readLiveReply(reader: FlexReader, request: BridgeRequest, account: string, signal: AbortSignal): Promise<BridgeReply>
```

| 매개변수 | 타입            | 기본값 | 의미                                                                                                         |
| -------- | --------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| reader   | `FlexReader`    | 없음   | 승인된 계정을 확인하고 Flex를 읽는 [어댑터](../../type/bridge/FlexReader.md)입니다. workStatus는 선택입니다. |
| request  | `BridgeRequest` | 없음   | 검증한 쿼리와 요청 ID입니다.                                                                                 |
| account  | `string`        | 없음   | 확장에 연결한 계정 식별값입니다.                                                                             |
| signal   | `AbortSignal`   | 없음   | 연결 해제와 응답 취소를 확인합니다.                                                                          |

| 반환                   | 의미                                          |
| ---------------------- | --------------------------------------------- |
| `Promise<BridgeReply>` | 요청 ID와 검증된 결과 또는 오류를 반환합니다. |

## 내부 로직

1. 근무 상태 요청이면 같은 계정의 workStatus를 호출합니다. 읽기 어댑터가 없거나 결과가 명세에 맞지 않으면 unknown을 반환합니다.
2. 근무 상태를 읽다가 권한 오류를 받으면 기존 오류를 반환합니다. 신호가 취소됐으면 결과를 반환하지 않습니다.
3. 요약 요청이면 20초 제한과 취소 신호를 적용합니다. 요약이 없거나 제한 시간이 지났으면 읽기 실패를 반환합니다.
4. 다른 요청이면 기존 Flex 조회로 보냅니다. 성공한 응답에 실조회 출처를 표시합니다.

## 사용법

```typescript
await readLiveReply(reader, request, approvedAccount, signal);
```

## 사용처

| 위치                                                | 용도                                                 |
| --------------------------------------------------- | ---------------------------------------------------- |
| [본인 근무 상태](../../feature/flex-work-status.md) | 승인된 채널로 읽은 상태 또는 접근 오류를 돌려줍니다. |

## TC

| ID                  | 조건                                                                         | 기대 결과                                                            |
| ------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| UT-readLiveReply-01 | 승인된 계정으로 상태를 읽거나 읽기 어댑터가 없거나 입력 결과가 잘못됐습니다. | 정상 상태를 보내고 어댑터 부재와 잘못된 결과에는 unknown을 보냅니다. |
| UT-readLiveReply-02 | 계정이 바뀌거나 읽기가 취소됐습니다.                                         | 상태 없이 오류만 반환합니다.                                         |
