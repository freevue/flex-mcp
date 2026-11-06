import { hasKeys, isRecord } from "../../../shared/index.ts";
import type { BrowserBinding } from "../src/access/types.ts";
import { attachBrowserBridge } from "../src/bridge/attachBrowserBridge.ts";
import type { BrowserConnection, RelayContext } from "../src/bridge/types.ts";
import { consumeBridgeTicket } from "../src/registration/bridgeTickets.ts";
import { asBrowserBinding, isSecret } from "../src/registration/stateDatabase.ts";
import type { StateDatabase } from "../src/registration/stateDatabase.ts";

type SocketCallbacks = { close?: () => void; reply?: (value: unknown) => void; timer?: ReturnType<typeof setTimeout> };

export function createBrowserSockets(context: DurableObjectState, database: StateDatabase, relay: RelayContext) {
  const callbacks = new Map<WebSocket, SocketCallbacks>();
  const textEncoder = new TextEncoder();

  function onClose(socket: WebSocket): void {
    const handler = callbacks.get(socket);
    if (!handler) return;
    callbacks.delete(socket);
    clearTimeout(handler.timer);
    handler.close?.();
  }

  function terminate(socket: WebSocket, code = 1008): void {
    onClose(socket);
    try { socket.close(code); } catch { /* 이미 닫힌 소켓입니다. */ }
  }

  function attach(socket: WebSocket, binding: BrowserBinding): boolean {
    if (relay.access.findBinding(binding.ownerId)?.bindingId !== binding.bindingId) return false;
    const state: SocketCallbacks = {};
    callbacks.set(socket, state);
    const connection: BrowserConnection = {
      ...binding,
      isOpen: () => socket.readyState === WebSocket.OPEN,
      send: request => socket.send(JSON.stringify(request)),
      close: () => terminate(socket, 1000),
      onClose: handler => { state.close = handler; },
      onReply: handler => { state.reply = handler; },
    };
    return attachBrowserBridge(binding, connection, relay.registry).ok;
  }

  for (const socket of context.getWebSockets()) {
    const stored: unknown = socket.deserializeAttachment();
    const binding = isRecord(stored) ? asBrowserBinding(stored) : null;
    if (!binding || !attach(socket, binding)) terminate(socket);
  }

  function open(): Response {
    const pair = new WebSocketPair();
    const socket = pair[1];
    context.acceptWebSocket(socket);
    callbacks.set(socket, { timer: setTimeout(() => terminate(socket), 5_000) });
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  function onMessage(socket: WebSocket, message: string | ArrayBuffer): void {
    const handler = callbacks.get(socket);
    if (!handler || typeof message !== "string" || message.length > 65_536
      || textEncoder.encode(message).byteLength > 65_536) return terminate(socket);
    try {
      const value: unknown = JSON.parse(message);
      if (!handler.reply) {
        clearTimeout(handler.timer);
        if (!isRecord(value) || !hasKeys(value, ["type", "ticket"]) || value.type !== "auth" || !isSecret(value.ticket)) {
          return terminate(socket);
        }
        const binding = consumeBridgeTicket(database, value.ticket);
        if (!binding || !attach(socket, binding)) return terminate(socket);
        socket.serializeAttachment(binding);
        socket.send('{"type":"ready"}');
        return;
      }
      if (isRecord(value) && hasKeys(value, ["type"]) && value.type === "ping") socket.send('{"type":"pong"}');
      else handler.reply(value);
    } catch {
      terminate(socket);
    }
  }

  return { open, onMessage, onClose, terminate };
}
