---
name: registerPairedReadTools
type: unit
module: mcp
issues: [26]
code: [apps/mcp-server/src/registerPairedReadTools.ts]
---

# registerPairedReadTools

승인한 연결 키가 필요한 근무 읽기 도구를 등록합니다.

## 시그니처

<!-- prettier-ignore -->
```typescript
export function registerPairedReadTools(server: McpServer, connectionKey: ZodString, reply: (query: BridgeQuery, connectionKey: string) => Promise<CallToolResult>): void
```

| 매개변수      | 타입                                                                     | 기본값 | 의미                                                   |
| ------------- | ------------------------------------------------------------------------ | ------ | ------------------------------------------------------ |
| server        | `McpServer`                                                              | 없음   | 도구를 등록할 MCP 서버입니다.                          |
| connectionKey | `ZodString`                                                              | 없음   | 승인 연결 키를 검사하는 기존 문자열 규칙입니다.        |
| reply         | `(query: BridgeQuery, connectionKey: string) => Promise<CallToolResult>` | 없음   | 검증된 쿼리와 연결 키를 처리하는 기존 응답 함수입니다. |

| 반환   | 의미                         |
| ------ | ---------------------------- |
| `void` | 서버에 두 도구를 등록합니다. |

## 내부 로직

1. 연결 키만 허용하는 입력 검사를 만듭니다.
2. 기존 flex_get_work_summary를 같은 이름과 설명으로 등록합니다. 호출 시 요약 요청을 보냅니다.
3. flex_get_work_status를 읽기 전용 도구로 등록합니다. 호출 시 현재 근무 상태 요청을 보냅니다.

## 사용법

```typescript
registerPairedReadTools(server, connectionKeyField, reply);
```

## 사용처

| 위치                                                | 용도                                              |
| --------------------------------------------------- | ------------------------------------------------- |
| [본인 근무 상태](../../feature/flex-work-status.md) | 승인한 Chrome 채널에서 두 근무 도구를 사용합니다. |

## TC

| ID                            | 조건                                                                         | 기대 결과                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| UT-registerPairedReadTools-01 | 연결 서버의 도구를 조회하고 올바른 키 및 여분 인자로 상태 도구를 호출합니다. | 두 도구가 등록됩니다. 여분 인자는 거부하고 올바른 호출은 현재 상태를 반환합니다. |
