import { parseUrl } from "./validation.ts";

export function parseBridgeOrigin(value: string): URL | null {
  const url = parseUrl(value);
  if (!url || url.username || url.password || url.pathname !== "/" || url.search || url.hash) return null;
  if (url.protocol === "https:" || (url.protocol === "http:" && url.hostname === "127.0.0.1")) return url;
  return null;
}
