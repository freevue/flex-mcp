import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { parseBridgeOrigin } from "../../shared/bridgeOrigin.ts";

const origin = parseBridgeOrigin(process.env.FLEX_EXTENSION_SERVER_URL ?? "http://127.0.0.1:8787");
if (!origin) throw new Error("확장 배포 서버 주소가 올바르지 않습니다.");
const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
manifest.host_permissions = [`${origin.protocol}//${origin.hostname}/*`];
writeFileSync("dist/manifest.json", JSON.stringify(manifest, null, 2));
writeFileSync("dist/extension-config.json", JSON.stringify({
  origin: origin.origin, demo: process.env.FLEX_EXTENSION_DEMO === "1",
}));
for (const name of ["popup.html", "popup.css"]) copyFileSync(name, `dist/${name}`);
writeFileSync("dist/service-worker.js", 'import "./apps/chrome-extension/src/service-worker.js";');
