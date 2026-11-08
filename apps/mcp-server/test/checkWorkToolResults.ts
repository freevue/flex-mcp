import assert from "node:assert/strict";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { isRecord } from "../../../shared/index.ts";

export function checkSummaryResponse(response: CallToolResult, reportsFlexSource: boolean): void {
  const month = response.structuredContent;
  assert.ok(isRecord(month));
  assert.equal(month.synthetic, reportsFlexSource ? undefined : true);
  assert.equal(typeof month.monthRecognizedMinutes, "number");
  assert.equal(typeof month.monthAnnualLeaveScheduledRecognizedMinutes, "number");
  assert.deepEqual(response.content[0], { type: "text", text: JSON.stringify(month) }, "FT-MCP-WORK-DISPLAY-01");
  assert.equal(response.content.length, 2, "FT-MCP-WORK-DISPLAY-01");
  const markdown = response.content[1];
  assert.ok(markdown?.type === "text" && typeof markdown.text === "string");
  assert.match(markdown.text, /^### 오늘 실제 근무\n5시간 20분/m);
  assert.equal(markdown.text.startsWith("예시 근무 데이터\n\n"), !reportsFlexSource, "FT-MCP-WORK-DISPLAY-02");
}

export async function checkPairedWorkStatus(client: Client, validKey: string, invalidReplyKey: string): Promise<void> {
  const query = (arguments_: Record<string, unknown>) => client.callTool({ name: "flex_get_work_status", arguments: arguments_ });
  const synthetic = await query({ connectionKey: validKey });
  assert.deepEqual(synthetic.structuredContent, { status: "working", synthetic: true }, "UT-registerPairedReadTools-01");
  const invalid = await query({ connectionKey: invalidReplyKey });
  assert.deepEqual(invalid.structuredContent, { code: "INVALID_BRIDGE_MESSAGE" }, "FT-FLEX-WORK-STATUS-02");
  assert.deepEqual((await query({ connectionKey: "a".repeat(43) })).structuredContent, { code: "ACCESS_DENIED" }, "FT-FLEX-WORK-STATUS-02");
  assert.equal((await query({ connectionKey: validKey, account: "other" })).isError, true, "UT-registerPairedReadTools-01");
}
