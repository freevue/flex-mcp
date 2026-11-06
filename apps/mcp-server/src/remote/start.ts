import { parseBridgeOrigin } from "../../../../shared/index.ts";
import { openStateDatabase } from "../registration/index.ts";
import { createRemoteServer } from "./index.ts";

const publicUrl = parseBridgeOrigin(process.env.FLEX_PUBLIC_URL ?? "");
const file = process.env.FLEX_STATE_FILE;
const ids = (process.env.FLEX_EXTENSION_IDS ?? "").split(",").map(id => id.trim());
const port = Number(process.env.FLEX_PORT ?? "8787");
if (!publicUrl || !file || file === ":memory:" || !ids.every(id => /^[a-p]{32}$/.test(id))
  || !Number.isSafeInteger(port) || port < 1024 || port > 65_535
  || (publicUrl.protocol === "http:" && Number(publicUrl.port) !== port)) {
  throw new Error("서버 주소, 상태 파일, 확장 ID와 수신 포트를 설정하세요.");
}

const extensionOrigins = new Set(ids.map(id => `chrome-extension://${id}`));
const database = openStateDatabase(file);
const server = createRemoteServer({ origin: publicUrl.origin, extensionOrigins }, database);
server.listen(port, "127.0.0.1", () => console.log(`합성 검증 서버가 127.0.0.1:${port}에서 대기합니다.`));
