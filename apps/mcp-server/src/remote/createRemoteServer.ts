import { createServer } from "node:http";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import type { DatabaseSync } from "node:sqlite";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { WebSocketServer } from "ws";
import { isExtensionOrigin } from "../../../../shared/index.ts";
import type { RelayContext } from "../bridge/index.ts";
import { createPairedMcpServer } from "../createPairedMcpServer.ts";
import { createAccessState } from "../registration/index.ts";
import { authenticateBrowserSocket, reconcileBrowserAccess } from "./browserSocket.ts";
import { readJson, sendJson } from "./http.ts";
import { handleRegistration } from "./registrationHttp.ts";

export type RemoteConfiguration = { origin: string };
const registrationPaths = new Set(["/bridge/pair/start", "/bridge/pair/invite", "/bridge/pair/claim", "/bridge/ticket", "/bridge/unpair"]);

export function createRemoteServer(configuration: RemoteConfiguration, database: DatabaseSync): Server {
  const relay: RelayContext = {
    access: createAccessState(database, true),
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
    if (request.method !== "POST") {
      response.setHeader("Allow", "POST");
      return sendJson(response, 405, { error: "METHOD_NOT_ALLOWED" });
    }
    const parsed = await readJson(request, 64 * 1024);
    if (parsed === undefined) {
      response.setHeader("Connection", "close");
      return sendJson(response, 400, { error: "INVALID_MCP_REQUEST" });
    }
    const mcp = createPairedMcpServer(database, relay);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    response.setHeader("Cache-Control", "no-store");
    response.once("close", () => { void mcp.close().catch(() => {}); });
    await mcp.connect(transport);
    await transport.handleRequest(request, response, parsed);
  }

  async function handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    if (request.url === "/mcp") return handleMcp(request, response);
    if (!registrationPaths.has(request.url ?? "")) return sendJson(response, 404, { error: "NOT_FOUND" });
    if (!isExtensionOrigin(request.headers.origin)) return sendJson(response, 403, { error: "ORIGIN_DENIED" });
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
    if (request.url !== "/bridge" || !isExtensionOrigin(request.headers.origin)) {
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
