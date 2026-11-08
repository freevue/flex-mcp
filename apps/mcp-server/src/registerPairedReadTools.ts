import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z as schema } from "zod";
import type { ZodString } from "zod";
import type { BridgeQuery } from "../../../shared/index.ts";

export const readOnlyAnnotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true };

/** 연결 키가 필요한 근무 도구를 등록합니다. @see wiki/unit/mcp/registerPairedReadTools.md */
export function registerPairedReadTools(
  server: McpServer,
  connectionKey: ZodString,
  reply: (query: BridgeQuery, connectionKey: string) => Promise<CallToolResult>
): void {
  const inputSchema = schema.strictObject({ connectionKey });
  server.registerTool(
    "flex_get_work_summary",
    {
      title: "이번 달 근무 요약",
      description: "한국 시간 기준 오늘 실제 근무, 이번 달 실제·인정 근무, 사용·예정 연차와 놀수 전후의 남은 시간을 분 단위로 조회합니다.",
      inputSchema,
      annotations: readOnlyAnnotations
    },
    (input) => reply({ kind: "summary" }, input.connectionKey)
  );
  server.registerTool(
    "flex_get_work_status",
    {
      title: "내 근무 상태",
      description: "연결한 본인의 현재 기록 상태를 조회합니다. 근무 중(working), 휴게 중(on_break), 기록 중 아님(idle), 확인 불가(unknown)를 구분합니다.",
      inputSchema,
      annotations: readOnlyAnnotations
    },
    (input) => reply({ kind: "workStatus" }, input.connectionKey)
  );
}
