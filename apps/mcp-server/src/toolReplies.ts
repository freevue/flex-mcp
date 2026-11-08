import type { AccessFailure } from "./access/index.ts";
import type { RelayFailure } from "./bridge/index.ts";

type ToolFailure = RelayFailure | AccessFailure | "CONNECTION_STATUS_FAILED" | "CONNECTION_DISCONNECT_FAILED";
export const errors: Record<ToolFailure, string> = {
  CONNECTION_DISCONNECT_FAILED: "MCP 연결을 해제하지 못했습니다.",
  CONNECTION_STATUS_FAILED: "Chrome 소켓 상태를 확인할 수 없습니다.",
  CALLER_UNVERIFIED: "호출자를 확인할 수 없습니다.",
  ACCESS_DENIED: "조회 권한이 없습니다.",
  BROWSER_OFFLINE: "연결한 Chrome이 오프라인입니다.",
  FLEX_TAB_UNAVAILABLE: "연결한 Chrome 프로필에서 flex를 여세요.",
  FLEX_REAUTH_REQUIRED: "같은 Chrome 프로필의 flex에서 다시 로그인하세요.",
  FLEX_ACCOUNT_MISMATCH: "연결한 flex 계정으로 전환하세요.",
  FLEX_SCOPE_UNAVAILABLE: "본인에게 적용되는 휴일 그룹 또는 승인된 조회 범위를 확인할 수 없습니다.",
  FLEX_NO_RECORDS: "조회할 기록이 없습니다.",
  FLEX_READ_FAILED: "flex 조회를 완료할 수 없습니다.",
  QUERY_TIMEOUT: "정해진 시간 안에 조회 응답이 오지 않았습니다.",
  INVALID_BRIDGE_MESSAGE: "서버와 Chrome 확장의 메시지 형식이 맞지 않습니다.",
  QUERY_LIMIT_REACHED: "대기 중인 조회가 많습니다. 잠시 뒤 다시 요청하세요."
};

export function errorReply(text: string, code?: ToolFailure) {
  return { isError: true, content: [{ type: "text" as const, text }], ...(code ? { structuredContent: { code } } : {}) };
}

export function successReply(result: Record<string, unknown>) {
  return { structuredContent: result, content: [{ type: "text" as const, text: JSON.stringify(result) }] };
}
