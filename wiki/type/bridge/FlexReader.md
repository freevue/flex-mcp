---
name: FlexReader
type: type
module: bridge
issues: [26]
code: [apps/chrome-extension/src/bridge/readLiveReply.ts]
---

# FlexReader

승인한 Chrome 프로필에서 Flex를 읽는 어댑터입니다.

## 정의

```typescript
export type FlexReader = {
  identify: () => Promise<Outcome<string, BrowserQueryFailure>>;
  read: (
    request: BridgeRequest,
    account: string,
    signal: AbortSignal,
  ) => Promise<BridgeReply>;
  workSummary: (
    account: string,
    signal: AbortSignal,
  ) => Promise<PopupWorkSummary | null>;
  workStatus?: (
    account: string,
    signal: AbortSignal,
  ) => Promise<Outcome<WorkStatusResult, BrowserQueryFailure>>;
};
```

## 필드

| 필드        | 타입                                                                                                | 필수   | 의미                                                          |
| ----------- | --------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------- |
| identify    | `() => Promise<Outcome<string, BrowserQueryFailure>>`                                               | 예     | 현재 로그인한 Flex 계정을 확인합니다.                         |
| read        | `(request: BridgeRequest, account: string, signal: AbortSignal) => Promise<BridgeReply>`            | 예     | 승인한 계정의 기존 Flex 쿼리를 처리합니다.                    |
| workSummary | `(account: string, signal: AbortSignal) => Promise<PopupWorkSummary \| null>`                       | 예     | 승인한 계정의 근무 요약을 읽습니다. null은 조회 불가입니다.   |
| workStatus  | `(account: string, signal: AbortSignal) => Promise<Outcome<WorkStatusResult, BrowserQueryFailure>>` | 아니오 | 승인한 계정의 현재 상태를 읽습니다. 생략하면 확인 불가입니다. |

## 사용처

| 위치                                                        | 용도                                           |
| ----------------------------------------------------------- | ---------------------------------------------- |
| [readLiveReply](../../unit/bridge/readLiveReply.md)         | 승인된 계정의 요청 종류에 맞춰 조회합니다.     |
| [갈피 근무 대시보드](../../feature/galpi-work-dashboard.md) | 팝업 진입 때 본인 근무 요약과 상태를 읽습니다. |
