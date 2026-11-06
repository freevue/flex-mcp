import { DurableObject } from "cloudflare:workers";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { isExtensionOrigin } from "../../../shared/index.ts";
import { revokeAccess } from "../src/access/revokeAccess.ts";
import type { RelayContext } from "../src/bridge/types.ts";
import { createPairedMcpServer } from "../src/createPairedMcpServer.ts";
import { createAccessState } from "../src/registration/accessState.ts";
import { issueBridgeTicket, verifyDeviceKey } from "../src/registration/bridgeTickets.ts";
import { claimDevicePairing, startDevicePairing } from "../src/registration/devicePairing.ts";
import { initializeStateDatabase, secretDigest } from "../src/registration/stateDatabase.ts";
import type { StateDatabase } from "../src/registration/stateDatabase.ts";
import { createBrowserSockets } from "./browserSockets.ts";
import { createWorkerDatabase } from "./environment.ts";
import type { WorkerEnvironment } from "./environment.ts";

const routes = new Set(["/mcp", "/bridge", "/bridge/pair/start", "/bridge/pair/claim", "/bridge/ticket", "/bridge/unpair"]);

function json(status: number, value: unknown): Response {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
}

function readBearer(request: Request): string {
  return /^Bearer ([A-Za-z0-9_-]{43})$/i.exec(request.headers.get("Authorization") ?? "")?.[1] ?? "";
}

export class FlexBridge extends DurableObject<WorkerEnvironment> {
  private readonly database: StateDatabase;
  private readonly relay: RelayContext;
  private readonly sockets: ReturnType<typeof createBrowserSockets>;

  constructor(context: DurableObjectState, environment: WorkerEnvironment) {
    super(context, environment);
    this.database = createWorkerDatabase(context.storage);
    initializeStateDatabase(this.database);
    this.database.exec(`CREATE TABLE IF NOT EXISTS worker_pair_rate (
      digest TEXT PRIMARY KEY, window INTEGER NOT NULL, count INTEGER NOT NULL
    )`);
    this.relay = { access: createAccessState(this.database, true), registry: { active: new Map(), pending: new Map() },
      maxPending: 32, timeoutMs: 8_000 };
    this.sockets = createBrowserSockets(context, this.database, this.relay);
  }

  private async handleMcp(request: Request): Promise<Response> {
    const origin = request.headers.get("Origin");
    if (origin !== null && origin !== new URL(request.url).origin) return json(403, { error: "ORIGIN_DENIED" });
    if (request.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST" } });
    const mcp = createPairedMcpServer(this.database, this.relay, () => this.allowPairingAttempt(request, "approve", 12));
    const transport = new WebStandardStreamableHTTPServerTransport({ enableJsonResponse: true, maxRequestBodySize: 65_536 });
    await mcp.connect(transport);
    try {
      const response = await transport.handleRequest(request);
      response.headers.set("Cache-Control", "no-store");
      return response;
    } finally {
      await mcp.close();
    }
  }

  private allowPairingAttempt(request: Request, kind: "start" | "approve", maximum: number): boolean {
    const window = Math.floor(Date.now() / 30_000);
    const digest = secretDigest(`${kind}:${window}:${request.headers.get("CF-Connecting-IP") ?? "local"}`);
    this.database.prepare("DELETE FROM worker_pair_rate WHERE window < ?").run(window);
    return Boolean(this.database.prepare(`INSERT INTO worker_pair_rate(digest, window, count)
      VALUES (?, ?, 1) ON CONFLICT(digest) DO UPDATE SET count = count + 1
      WHERE count < ? RETURNING count`).get(digest, window, maximum));
  }

  private handleRegistration(request: Request, path: string): Response {
    if (request.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST" } });
    const key = readBearer(request);
    if (path === "/bridge/pair/start") {
      if (!this.allowPairingAttempt(request, "start", 6)) return json(429, { error: "PAIRING_LIMIT" });
      const started = startDevicePairing(this.database, key);
      return started ? json(201, started) : json(429, { error: "PAIRING_LIMIT" });
    }
    if (path === "/bridge/pair/claim") {
      const claim = claimDevicePairing(this.database, key);
      if (claim.status === "registered") this.removeStaleConnections();
      return json(200, claim);
    }
    if (path === "/bridge/ticket") {
      const ticket = issueBridgeTicket(this.database, key, undefined, true);
      return ticket ? json(200, { ticket }) : json(401, { error: "INVALID_DEVICE_KEY" });
    }
    const binding = verifyDeviceKey(this.database, key);
    if (!binding || !revokeAccess(binding, { kind: "profile", bindingId: binding.bindingId },
      this.relay.access, this.relay.registry).ok) return json(401, { error: "INVALID_DEVICE_KEY" });
    this.database.prepare("DELETE FROM channel_pairing WHERE replaces_binding_id = ?").run(binding.bindingId);
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }

  private removeStaleConnections(): void {
    for (const [bindingId, connection] of this.relay.registry.active) {
      if (this.relay.access.findBinding(connection.ownerId)?.bindingId === bindingId) continue;
      this.relay.registry.active.delete(bindingId);
      connection.close();
    }
  }

  async fetch(request: Request): Promise<Response> {
    const path = new URL(request.url).pathname;
    try {
      if (path === "/mcp") return await this.handleMcp(request);
      if (!isExtensionOrigin(request.headers.get("Origin"))) return json(403, { error: "ORIGIN_DENIED" });
      if (path === "/bridge") {
        if (request.method !== "GET" || request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
          return json(426, { error: "WEBSOCKET_REQUIRED" });
        }
        return this.sockets.open();
      }
      return this.handleRegistration(request, path);
    } catch {
      return json(500, { error: "SERVER_ERROR" });
    }
  }

  webSocketMessage(socket: WebSocket, message: string | ArrayBuffer): void {
    this.sockets.onMessage(socket, message);
  }

  webSocketClose(socket: WebSocket, code: number): void {
    this.sockets.onClose(socket);
    try { socket.close(code); } catch { /* 연결이 이미 닫혔습니다. */ }
  }

  webSocketError(socket: WebSocket): void {
    this.sockets.terminate(socket);
  }
}

const worker: ExportedHandler<WorkerEnvironment> = {
  fetch(request, environment) {
    const url = new URL(request.url);
    if (environment.FLEX_PUBLIC_ORIGIN && url.origin !== environment.FLEX_PUBLIC_ORIGIN) return json(403, { error: "ORIGIN_DENIED" });
    if (!routes.has(url.pathname) || url.search) return json(404, { error: "NOT_FOUND" });
    return environment.BRIDGE.getByName("shared").fetch(request);
  },
};
export { worker as default };
