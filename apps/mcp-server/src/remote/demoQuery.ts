import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { parseBridgeOrigin } from "../../../../shared/index.ts";

const origin = parseBridgeOrigin(process.env.FLEX_PUBLIC_URL ?? "");
const key = process.env.FLEX_AGENT_KEY;
if (!origin || !key || !/^[A-Za-z0-9_-]{43}$/.test(key)) {
  throw new Error("FLEX_PUBLIC_URL과 FLEX_AGENT_KEY를 설정하세요.");
}
const client = new Client({ name: "flex-demo-query", version: "0.1.0" });
try {
  await client.connect(new StreamableHTTPClientTransport(new URL("/mcp", origin), {
    requestInit: { headers: { Authorization: `Bearer ${key}` } },
  }));
  const result = await client.callTool({ name: "flex_get_schedule" });
  console.log(JSON.stringify(result.structuredContent ?? result.content, null, 2));
  if (result.isError) process.exitCode = 1;
} catch {
  console.error("합성 조회에 실패했습니다. 서버 주소와 에이전트 키를 확인하세요.");
  process.exitCode = 1;
} finally {
  await client.close();
}
