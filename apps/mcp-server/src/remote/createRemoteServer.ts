import { createServer } from "node:http";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import type { DatabaseSync } from "node:sqlite";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { WebSocketServer } from "ws";
import type { RelayContext } from "../bridge/index.ts";
import { createCallerMcpServer } from "../createCallerMcpServer.ts";
import { createAccessState, verifyAgentKey } from "../registration/index.ts";
import { authenticateBrowserSocket, reconcileBrowserAccess } from "./browserSocket.ts";
import { readBearer, readJson, sendJson } from "./http.ts";
import { handleRegistration } from "./registrationHttp.ts";

export type RemoteConfiguration = { origin: string; extensionOrigins: ReadonlySet<string> };
const registrationPaths = new Set(["/bridge/pair", "/bridge/ticket", "/bridge/unpair"]);

export function createRemoteServer(configuration: RemoteConfiguration, database: DatabaseSync): Server {
  const relay: RelayContext = {
    access: createAccessState(database),
    registry: { active: new Map(), pending: new Map() },
    timeoutMs: 8_000,
    maxPending: 32,
  };
  const sockets = new WebSocketServer({ noServer: true, perMessageDeflate: false, maxPayload: 64 * 1024 });
  sockets.on("connection", socket => authenticateBrowserSocket(socket, database, relay));

  async function handleMcp(request: IncomingMessage, response: ServerResponse): Promise<void> {
    if (request.headers.origin !== undefined && request.headers.origin !== configuration.origin) {
      return sendJson(response, 403, { error: "ORIGIN_DENIED" });
    }
    const identity = verifyAgentKey(database, readBearer(request));
    if (!identity) {
      response.setHeader("WWW-Authenticate", 'Bearer realm="flex-demo"');
      return sendJson(response, 401, { error: "INVALID_AGENT_KEY" });
    }

    const parsed = request.method === "POST" ? await readJson(request, 64 * 1024) : undefined;
    if (request.method === "POST" && parsed === undefined) {
      response.setHeader("Connection", "close");
      return sendJson(response, 400, { error: "INVALID_MCP_REQUEST" });
    }
    const mcp = createCallerMcpServer(identity, relay, undefined, true);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    response.setHeader("Cache-Control", "no-store");
    response.once("close", () => { void mcp.close().catch(() => {}); });
    await mcp.connect(transport);
    await transport.handleRequest(request, response, parsed);
  }

  async function handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    if (request.url === "/mcp") return handleMcp(request, response);
    if (!registrationPaths.has(request.url ?? "")) return sendJson(response, 404, { error: "NOT_FOUND" });
    if (request.headers.origin !== undefined && !configuration.extensionOrigins.has(request.headers.origin)) {
      return sendJson(response, 403, { error: "ORIGIN_DENIED" });
    }
    return handleRegistration(request, response, database, relay);
  }

  const server = createServer({ requestTimeout: 15_000, headersTimeout: 10_000 }, (request, response) => {
    void handle(request, response).catch(() => {
      if (!response.headersSent) sendJson(response, 500, { error: "SERVER_ERROR" });
      else response.destroy();
    });
  });
  server.maxConnections = 128;
  server.on("upgrade", (request, socket, head) => {
    if (request.url !== "/bridge" || !configuration.extensionOrigins.has(request.headers.origin ?? "")) {
      socket.end("HTTP/1.1 403 Forbidden\r\nConnection: close\r\nContent-Length: 0\r\n\r\n");
      return;
    }
    sockets.handleUpgrade(request, socket, head, connection => sockets.emit("connection", connection));
  });
  const reconcile = setInterval(() => {
    try {
      reconcileBrowserAccess(relay);
    } catch {
      for (const connection of sockets.clients) connection.terminate();
    }
  }, 2_000).unref();
  server.on("close", () => {
    clearInterval(reconcile);
    for (const connection of sockets.clients) connection.terminate();
    sockets.close();
  });
  return server;
}
