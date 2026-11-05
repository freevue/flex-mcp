import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { resolveRange, seoulDate, shiftDate } from "./dates.ts";

const server = new McpServer({ name: "flex", version: "0.1.0" });
const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true };
const rangeFields = z.strictObject({
  from: z.iso.date().optional().describe("시작일(포함), YYYY-MM-DD"),
  to: z.iso.date().optional().describe("종료일(포함), YYYY-MM-DD"),
});

function errorReply(text: string) {
  return { isError: true, content: [{ type: "text" as const, text }] };
}

function reply(validate?: () => void) {
  try {
    validate?.();
  } catch (error) {
    return errorReply(error instanceof Error ? error.message : "조회 범위를 확인하세요.");
  }
  return errorReply("조회 연결이 구성되지 않았습니다.");
}

server.registerTool("flex_get_annual_leave", {
  title: "내 연차 잔액",
  description: "flex에 로그인한 본인의 현재 연차 잔여량과 사용 가능량을 일·분 단위로 조회합니다.",
  inputSchema: z.strictObject({}),
  annotations,
}, () => reply());

server.registerTool("flex_get_schedule", {
  title: "내 일정",
  description: "flex 본인 기본 캘린더를 조회합니다. 한국 시간 기준 기본값은 오늘부터 7일입니다. 기간은 두 날짜를 함께 지정하며 최대 31일입니다.",
  inputSchema: rangeFields,
  annotations,
}, input => reply(() => {
  const today = seoulDate();
  resolveRange(input, { from: today, to: shiftDate(today, 6) });
}));

server.registerTool("flex_get_work_hours", {
  title: "내 근무 시간",
  description: "flex의 실제·인정·소정·연장근무 및 휴가 시간을 분 단위로 조회합니다. 기본값은 한국 시간 기준 이번 달 1일부터 오늘까지입니다. 기간은 두 날짜를 함께 지정하며 최대 31일입니다.",
  inputSchema: rangeFields,
  annotations,
}, input => reply(() => {
  const today = seoulDate();
  resolveRange(input, { from: `${today.slice(0, 7)}-01`, to: today });
}));

await server.connect(new StdioServerTransport());
