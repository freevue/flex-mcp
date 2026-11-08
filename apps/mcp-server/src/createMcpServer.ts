import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z as schema } from "zod";
import serverPackage from "../package.json" with { type: "json" };
import type { BridgeQuery, BridgeResult, DateRange, FlexQuery, Outcome } from "../../../shared/index.ts";
import type { AccessFailure } from "./access/index.ts";
import type { RelayFailure } from "./bridge/index.ts";
import { resolveRange, seoulDate, shiftDate } from "./dates.ts";
import { formatWorkSummaryMarkdown } from "./formatWorkSummaryMarkdown.ts";
import { readOnlyAnnotations as annotations, registerPairedReadTools } from "./registerPairedReadTools.ts";
import { browserConnectionStates } from "./operations/index.ts";
import type { BrowserConnectionStatus } from "./operations/index.ts";

import { errorReply, errors, successReply } from "./toolReplies.ts";
type ToolHandlers = {
  query: (query: BridgeQuery, connectionKey?: string) => Promise<Outcome<BridgeResult, RelayFailure | AccessFailure>>;
  connectionStatus?: (connectionKey?: string) => Outcome<BrowserConnectionStatus, AccessFailure>;
  approveConnection?: (code: string) => string | null;
  channelPairing?: true;
};
const rangeFields = {
  from: schema.iso.date().optional().describe("시작일(포함), YYYY-MM-DD"),
  to: schema.iso.date().optional().describe("종료일(포함), YYYY-MM-DD")
};
const connectionKeyField = schema
  .string()
  .regex(/^[A-Za-z0-9_-]{43}$/)
  .describe("연결 승인 때 받은 비공개 연결 키");
export function createMcpServer(handlers?: ToolHandlers, now = () => new Date(), synthetic = false): McpServer {
  const server = new McpServer({ name: synthetic ? "flex-demo" : "flex", version: serverPackage.version });
  const channelFields = { connectionKey: handlers?.channelPairing ? connectionKeyField : schema.never().optional() };
  const channelSchema = schema.strictObject(channelFields);
  const rangeSchema = schema.strictObject({ ...rangeFields, ...channelFields });
  async function reply(buildQuery: () => BridgeQuery, connectionKey?: string) {
    let query: BridgeQuery;
    try {
      query = buildQuery();
    } catch (error) {
      return errorReply(error instanceof Error ? error.message : "조회 범위를 확인하세요.");
    }
    if (!handlers) return errorReply("조회 연결이 구성되지 않았습니다.");
    try {
      const outcome = await handlers.query(query, connectionKey);
      if (!outcome.ok) return errorReply(errors[outcome.error], outcome.error);
      const result = synthetic ? { ...outcome.value, synthetic: true } : outcome.value;
      const response = successReply(result);
      const markdown = query.kind === "summary" ? formatWorkSummaryMarkdown(result) : undefined;
      if (markdown !== undefined) response.content.push({ type: "text", text: markdown });
      return response;
    } catch {
      return errorReply(errors.FLEX_READ_FAILED, "FLEX_READ_FAILED");
    }
  }

  function buildRange(kind: "schedule" | "work", input: Partial<DateRange>): FlexQuery {
    const today = seoulDate(now());
    const fallback = kind === "schedule" ? { from: today, to: shiftDate(today, 6) } : { from: `${today.slice(0, 7)}-01`, to: today };
    return { kind, range: resolveRange(input, fallback) };
  }

  server.registerTool(
    "flex_get_annual_leave",
    {
      title: "내 연차 잔액",
      description: "flex에 로그인한 본인의 현재 연차 잔여량과 사용 가능량을 일·분 단위로 조회합니다.",
      inputSchema: channelSchema,
      annotations
    },
    ({ connectionKey }) => reply(() => ({ kind: "leave" }), connectionKey)
  );

  server.registerTool(
    "flex_get_schedule",
    {
      title: "내 일정",
      description: "flex 본인 기본 캘린더를 조회합니다. 한국 시간 기준 기본값은 오늘부터 7일입니다. 기간은 두 날짜를 함께 지정하며 최대 31일입니다.",
      inputSchema: rangeSchema,
      annotations
    },
    (input) => reply(() => buildRange("schedule", input), input.connectionKey)
  );

  server.registerTool(
    "flex_get_work_hours",
    {
      title: "내 근무 시간",
      description:
        "flex의 실제·인정·소정·연장근무 및 휴가 시간을 분 단위로 조회합니다. 기본값은 한국 시간 기준 이번 달 1일부터 오늘까지입니다. 기간은 두 날짜를 함께 지정하며 최대 31일입니다.",
      inputSchema: rangeSchema,
      annotations
    },
    (input) => reply(() => buildRange("work", input), input.connectionKey)
  );

  if (handlers?.channelPairing) registerPairedReadTools(server, connectionKeyField, (query, key) => reply(() => query, key));

  if (handlers && !handlers.connectionStatus) return server;

  server.registerTool(
    "flex_get_socket_status",
    {
      title: "내 Chrome 소켓 상태",
      description: "본인의 Chrome 확장이 이 서버에 등록됐는지, 현재 소켓이 열려 있는지 확인합니다. flex 로그인이나 조회 가능 여부는 확인하지 않습니다.",
      inputSchema: channelSchema,
      outputSchema: schema.strictObject({ status: schema.enum(browserConnectionStates) }),
      annotations
    },
    ({ connectionKey }) => {
      if (!handlers?.connectionStatus) return errorReply("조회 연결이 구성되지 않았습니다.");
      try {
        const outcome = handlers.connectionStatus(connectionKey);
        return outcome.ok ? successReply(outcome.value) : errorReply(errors[outcome.error]);
      } catch {
        return errorReply(errors.CONNECTION_STATUS_FAILED);
      }
    }
  );

  server.registerTool(
    "flex_approve_connection",
    {
      title: "Chrome 연결 승인",
      description: "Chrome 팝업의 일회용 코드를 연결 키로 바꿉니다. 이후 조회에 연결 키를 사용하고 공개 메시지에 표시하지 않습니다.",
      inputSchema: schema.strictObject({ approvalCode: schema.string().regex(/^[0-9A-F]{4}(?:-[0-9A-F]{4}){2}$/) }),
      outputSchema: schema.strictObject({ status: schema.literal("approved"), connectionKey: connectionKeyField }),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false }
    },
    ({ approvalCode }) => {
      if (!handlers?.approveConnection) return errorReply("조회 연결이 구성되지 않았습니다.");
      try {
        const connectionKey = handlers.approveConnection(approvalCode);
        return connectionKey ? successReply({ status: "approved", connectionKey }) : errorReply("유효한 연결 코드를 확인하세요.");
      } catch {
        return errorReply("Chrome 연결을 승인하지 못했습니다.");
      }
    }
  );

  return server;
}
