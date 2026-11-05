import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./createMcpServer.ts";

await createMcpServer().connect(new StdioServerTransport());
