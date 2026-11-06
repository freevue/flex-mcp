import { hasKeys, isRecord, parseBridgeOrigin } from "../../../../shared/index.ts";
import type { BridgeReply, BridgeRequest } from "../../../../shared/index.ts";
import { parseBridgeRequest } from "./parseBridgeRequest.ts";

type SocketState = "offline" | "online" | "stopped";
export type BridgeConfig = {
  url: string;
  retryDelayMs: number;
  openSocket: (url: string) => WebSocket;
  getTicket: (signal: AbortSignal) => Promise<string>;
  onState?: (state: SocketState) => void;
};
export type BridgeControl = { state: () => SocketState; close: () => void };

function decode(value: unknown): unknown {
  if (typeof value !== "string" || value.length > 64 * 1024) return null;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

export function connectBridge(config: BridgeConfig,
  onRequest: (request: BridgeRequest, signal: AbortSignal) => Promise<BridgeReply>): BridgeControl {
  let state: SocketState = "offline";
  let socket: WebSocket | undefined;
  let lifetime: AbortController | undefined;
  let retry: ReturnType<typeof setTimeout> | undefined;
  const origin = parseBridgeOrigin(config.url);

  function report(next: SocketState) {
    state = next;
    config.onState?.(state);
  }

  function scheduleRetry() {
    if (state === "stopped" || retry !== undefined) return;
    retry = setTimeout(() => {
      retry = undefined;
      void open();
    }, config.retryDelayMs);
  }

  async function open() {
    if (state === "stopped" || !origin || !Number.isSafeInteger(config.retryDelayMs) || config.retryDelayMs < 1) return;
    const active = new AbortController();
    lifetime = active;
    const url = new URL("/bridge", origin);
    url.protocol = origin.protocol === "https:" ? "wss:" : "ws:";
    let current: WebSocket;
    let ticket: string;
    try {
      ticket = await config.getTicket(active.signal);
      if (active.signal.aborted) return;
      current = config.openSocket(url.href);
    } catch {
      scheduleRetry();
      return;
    }

    socket = current;
    let lastMessage = Date.now();
    const authenticate = setTimeout(() => current.close(), 7_000);
    const heartbeat = setInterval(() => {
      if (socket !== current || state !== "online") return;
      if (Date.now() - lastMessage > 45_000) return current.close();
      try {
        current.send('{"type":"ping"}');
      } catch {
        current.close();
      }
    }, 20_000);
    current.addEventListener("open", () => {
      if (socket === current) current.send(JSON.stringify({ type: "auth", ticket }));
    });
    current.addEventListener("message", async event => {
      if (socket !== current) return;
      const value = decode(event.data);
      const control = isRecord(value) && hasKeys(value, ["type"]) ? value.type : null;
      if (state === "offline") {
        if (control === "ready") {
          clearTimeout(authenticate);
          lastMessage = Date.now();
          report("online");
        }
        return;
      }
      if (state !== "online") return;
      lastMessage = Date.now();
      if (control === "pong") return;
      const request = parseBridgeRequest(value);
      if (!request.ok) return;
      const { requestId } = request.value;
      let reply: BridgeReply;
      try {
        reply = await onRequest(request.value, active.signal);
      } catch {
        reply = { requestId, error: "FLEX_READ_FAILED" };
      }
      if (socket !== current || active.signal.aborted || state !== "online" || reply.requestId !== requestId) return;
      try {
        current.send(JSON.stringify(reply));
      } catch {
        current.close();
      }
    });
    current.addEventListener("close", () => {
      clearTimeout(authenticate);
      clearInterval(heartbeat);
      if (socket !== current) return;
      socket = undefined;
      active.abort();
      report("offline");
      scheduleRetry();
    });
    current.addEventListener("error", () => {
      if (socket === current) current.close();
    });
  }

  report("offline");
  void open();
  return {
    state: () => state,
    close: () => {
      report("stopped");
      clearTimeout(retry);
      const current = socket;
      socket = undefined;
      lifetime?.abort();
      current?.close();
    },
  };
}
