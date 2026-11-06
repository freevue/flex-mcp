import type { IncomingMessage, ServerResponse } from "node:http";

export function readBearer(request: IncomingMessage): string {
  return /^Bearer ([A-Za-z0-9_-]{43})$/i.exec(request.headers.authorization ?? "")?.[1] ?? "";
}

export function sendJson(response: ServerResponse, status: number, value: unknown): void {
  response.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  response.end(JSON.stringify(value));
}

export async function readJson(request: IncomingMessage, limit: number): Promise<unknown> {
  if (request.headers["content-type"]?.split(";")[0]?.trim().toLowerCase() !== "application/json") return undefined;
  const length = request.headers["content-length"];
  if (length !== undefined && (!/^\d+$/.test(length) || Number(length) > limit)) return undefined;
  let bytes = 0;
  const chunks: Buffer[] = [];
  try {
    for await (const chunk of request.iterator({ destroyOnReturn: false })) {
      if (!Buffer.isBuffer(chunk)) return undefined;
      bytes += chunk.length;
      if (bytes > limit) return undefined;
      chunks.push(chunk);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    return undefined;
  }
}
