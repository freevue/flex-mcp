import type { DatabaseSync } from "node:sqlite";
import { WebSocket } from "ws";
import type { RawData } from "ws";
import { failure, hasKeys, isRecord } from "../../../../shared/index.ts";
import { resolveBrowserBinding } from "../access/index.ts";
import { attachBrowserBridge } from "../bridge/index.ts";
import type { BrowserConnection, RelayContext } from "../bridge/index.ts";
import { consumeBridgeTicket, isSecret } from "../registration/index.ts";

function decode(data: RawData, binary: boolean): unknown {
  if (binary || !Buffer.isBuffer(data)) return undefined;
  try {
    return JSON.parse(data.toString("utf8")) as unknown;
  } catch {
    return undefined;
  }
}

export function authenticateBrowserSocket(socket: WebSocket, database: DatabaseSync, relay: RelayContext): void {
  const timeout = setTimeout(() => socket.terminate(), 5_000);
  socket.once("close", () => clearTimeout(timeout));
  socket.on("error", () => socket.terminate());
  socket.once("message", (data, binary) => {
    clearTimeout(timeout);
    try {
      const value = decode(data, binary);
      if (!isRecord(value) || !hasKeys(value, ["type", "ticket"]) || value.type !== "auth" || !isSecret(value.ticket)) {
        return socket.terminate();
      }
      const binding = consumeBridgeTicket(database, value.ticket);
      if (!binding || relay.access.findBinding(binding.ownerId)?.bindingId !== binding.bindingId) return socket.terminate();
      const isOpen = () => socket.readyState === WebSocket.OPEN;
      const connection: BrowserConnection = {
        ...binding,
        isOpen,
        send: request => {
          if (!isOpen()) throw new Error("Chrome 연결이 닫혔습니다.");
          socket.send(JSON.stringify(request));
        },
        close: () => socket.terminate(),
        onClose: receive => socket.once("close", receive),
        onReply: receive => socket.on("message", (message, isBinary) => {
          const payload = decode(message, isBinary);
          if (isRecord(payload) && hasKeys(payload, ["type"]) && payload.type === "ping") {
            if (isOpen()) socket.send('{"type":"pong"}');
            return;
          }
          receive(payload);
        }),
      };
      if (!attachBrowserBridge(binding, connection, relay.registry).ok) return socket.terminate();
      socket.send('{"type":"ready"}');
    } catch {
      socket.terminate();
    }
  });
}

export function reconcileBrowserAccess(relay: RelayContext): void {
  for (const pending of relay.registry.pending.values()) {
    if (!resolveBrowserBinding(pending.caller, relay.access).ok) pending.finish(failure("ACCESS_DENIED"));
  }
  for (const [bindingId, connection] of relay.registry.active) {
    if (relay.access.findBinding(connection.ownerId)?.bindingId === bindingId) continue;
    relay.registry.active.delete(bindingId);
    connection.close();
  }
}
