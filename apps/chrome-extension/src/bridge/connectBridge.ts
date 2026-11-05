import { parseUrl } from "../../../../shared/index.ts";
import type { BridgeReply, BridgeRequest } from "../../../../shared/index.ts";
import { parseBridgeRequest } from "./parseBridgeRequest.ts";

export type BridgeConfig = {
  url: string;
  retryDelayMs: number;
  openSocket: (url: string) => WebSocket;
};
export type BridgeControl = { state: () => "offline" | "online" | "stopped"; close: () => void };

function decode(value: unknown): unknown {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

export function connectBridge(config: BridgeConfig,
  onRequest: (request: BridgeRequest, signal: AbortSignal) => Promise<BridgeReply>): BridgeControl {
  let state: ReturnType<BridgeControl["state"]> = "offline";
  let socket: WebSocket | undefined;
  let lifetime: AbortController | undefined;
  let retry: ReturnType<typeof setTimeout> | undefined;
  const url = parseUrl(config.url);

  function scheduleRetry() {
    if (state === "stopped" || retry !== undefined) return;
    retry = setTimeout(() => {
      retry = undefined;
      open();
    }, config.retryDelayMs);
  }

  function open() {
    if (state === "stopped" || !url || url.protocol !== "wss:" || url.username || url.password || url.hash
      || !Number.isSafeInteger(config.retryDelayMs) || config.retryDelayMs < 1) return;
    const active = new AbortController();
    let current: WebSocket;
    try {
      current = config.openSocket(url.href);
    } catch {
      scheduleRetry();
      return;
    }

    socket = current;
    lifetime = active;
    current.addEventListener("open", () => {
      if (socket === current) state = "online";
    });
    current.addEventListener("message", async event => {
      if (socket !== current || state !== "online") return;
      const request = parseBridgeRequest(decode(event.data));
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
      if (socket !== current) return;
      socket = undefined;
      active.abort();
      state = "offline";
      scheduleRetry();
    });
    current.addEventListener("error", () => {
      if (socket === current) current.close();
    });
  }

  open();
  return {
    state: () => state,
    close: () => {
      state = "stopped";
      clearTimeout(retry);
      const current = socket;
      socket = undefined;
      lifetime?.abort();
      current?.close();
    },
  };
}
