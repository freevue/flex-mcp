import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z as schema } from "zod";
import type { DateRange, FlexQuery, FlexResult, Outcome } from "../../../shared/index.ts";
import type { AccessFailure } from "./access/index.ts";
import type { RelayFailure } from "./bridge/index.ts";
import { resolveRange, seoulDate, shiftDate } from "./dates.ts";
import { browserConnectionStates } from "./operations/index.ts";
import type { BrowserConnectionStatus } from "./operations/index.ts";

type ToolFailure = RelayFailure | AccessFailure | "CONNECTION_STATUS_FAILED";
type ToolHandlers = {
  query: (query: FlexQuery) => Promise<Outcome<FlexResult, RelayFailure | AccessFailure>>;
  connectionStatus?: () => Outcome<BrowserConnectionStatus, AccessFailure>;
  approveConnection?: (code: string) => boolean;
};
const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true };
const rangeFields = schema.strictObject({
  from: schema.iso.date().optional().describe("시작일(포함), YYYY-MM-DD"),
  to: schema.iso.date().optional().describe("종료일(포함), YYYY-MM-DD"),
});
const errors: Record<ToolFailure, string> = {
  CONNECTION_STATUS_FAILED: "Chrome 소켓 상태를 확인할 수 없습니다.",
  CALLER_UNVERIFIED: "호출자를 확인할 수 없습니다.",
  ACCESS_DENIED: "조회 권한이 없습니다.",
  BROWSER_OFFLINE: "연결한 Chrome이 오프라인입니다.",
  FLEX_TAB_UNAVAILABLE: "연결한 Chrome 프로필에서 flex를 여세요.",
  FLEX_REAUTH_REQUIRED: "같은 Chrome 프로필의 flex에서 다시 로그인하세요.",
  FLEX_ACCOUNT_MISMATCH: "연결한 flex 계정으로 전환하세요.",
  FLEX_NO_RECORDS: "조회할 기록이 없습니다.",
  FLEX_READ_FAILED: "flex 조회를 완료할 수 없습니다.",
  QUERY_TIMEOUT: "정해진 시간 안에 조회 응답이 오지 않았습니다.",
  INVALID_BRIDGE_MESSAGE: "서버와 Chrome 확장의 메시지 형식이 맞지 않습니다.",
  QUERY_LIMIT_REACHED: "대기 중인 조회가 많습니다. 잠시 뒤 다시 요청하세요.",
};

function errorReply(text: string, code?: ToolFailure) {
  return { isError: true, content: [{ type: "text" as const, text }], ...(code ? { structuredContent: { code } } : {}) };
}

function successReply(result: Record<string, unknown>) {
  return { structuredContent: result, content: [{ type: "text" as const, text: JSON.stringify(result) }] };
}

export function createMcpServer(handlers?: ToolHandlers, now = () => new Date(), synthetic = false): McpServer {
  const server = new McpServer({ name: synthetic ? "flex-demo" : "flex", version: "0.1.0" });
  async function reply(buildQuery: () => FlexQuery) {
    let query: FlexQuery;
    try {
      query = buildQuery();
    } catch (error) {
      return errorReply(error instanceof Error ? error.message : "조회 범위를 확인하세요.");
    }
    if (!handlers) return errorReply("조회 연결이 구성되지 않았습니다.");
    try {
      const outcome = await handlers.query(query);
      if (!outcome.ok) return errorReply(errors[outcome.error], outcome.error);
      const result = synthetic ? { ...outcome.value, synthetic: true } : outcome.value;
      return successReply(result);
    } catch {
      return errorReply(errors.FLEX_READ_FAILED, "FLEX_READ_FAILED");
    }
  }

  function buildRange(kind: "schedule" | "work", input: Partial<DateRange>): FlexQuery {
    const today = seoulDate(now());
    const fallback = kind === "schedule" ? { from: today, to: shiftDate(today, 6) }
      : { from: `${today.slice(0, 7)}-01`, to: today };
    return { kind, range: resolveRange(input, fallback) };
  }

  server.registerTool("flex_get_annual_leave", {
    title: "내 연차 잔액",
    description: "flex에 로그인한 본인의 현재 연차 잔여량과 사용 가능량을 일·분 단위로 조회합니다.",
    inputSchema: schema.strictObject({}),
    annotations,
  }, () => reply(() => ({ kind: "leave" })));

  server.registerTool("flex_get_schedule", {
    title: "내 일정",
    description: "flex 본인 기본 캘린더를 조회합니다. 한국 시간 기준 기본값은 오늘부터 7일입니다. 기간은 두 날짜를 함께 지정하며 최대 31일입니다.",
    inputSchema: rangeFields,
    annotations,
  }, input => reply(() => buildRange("schedule", input)));

  server.registerTool("flex_get_work_hours", {
    title: "내 근무 시간",
    description: "flex의 실제·인정·소정·연장근무 및 휴가 시간을 분 단위로 조회합니다. 기본값은 한국 시간 기준 이번 달 1일부터 오늘까지입니다. 기간은 두 날짜를 함께 지정하며 최대 31일입니다.",
    inputSchema: rangeFields,
    annotations,
  }, input => reply(() => buildRange("work", input)));

  if (handlers && !handlers.connectionStatus) return server;

  server.registerTool("flex_get_socket_status", {
    title: "내 Chrome 소켓 상태",
    description: "본인의 Chrome 확장이 이 서버에 등록됐는지, 현재 소켓이 열려 있는지 확인합니다. flex 로그인이나 조회 가능 여부는 확인하지 않습니다.",
    inputSchema: schema.strictObject({}),
    outputSchema: schema.strictObject({ status: schema.enum(browserConnectionStates) }),
    annotations,
  }, () => {
    if (!handlers?.connectionStatus) return errorReply("조회 연결이 구성되지 않았습니다.");
    try {
      const outcome = handlers.connectionStatus();
      return outcome.ok ? successReply(outcome.value) : errorReply(errors[outcome.error], outcome.error);
    } catch {
      return errorReply(errors.CONNECTION_STATUS_FAILED, "CONNECTION_STATUS_FAILED");
    }
  });

  server.registerTool("flex_approve_connection", {
    title: "Chrome 연결 승인",
    description: "사용자가 자신의 Chrome 연결 승인을 명시적으로 요청할 때 팝업의 승인 코드를 확인합니다. 승인 후 팝업에서 연결 상태를 확인합니다.",
    inputSchema: schema.strictObject({ approvalCode: schema.string().regex(/^[0-9A-F]{4}(?:-[0-9A-F]{4}){2}$/) }),
    outputSchema: schema.strictObject({ status: schema.literal("approved") }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
  }, ({ approvalCode }) => {
    if (!handlers?.approveConnection) return errorReply("조회 연결이 구성되지 않았습니다.");
    try {
      return handlers.approveConnection(approvalCode) ? successReply({ status: "approved" })
        : errorReply("승인 권한과 유효한 연결 코드를 확인하세요.", "ACCESS_DENIED");
    } catch {
      return errorReply("Chrome 연결을 승인하지 못했습니다.");
    }
  });

  return server;
}
