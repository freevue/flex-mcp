import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import extensionManifest from "../apps/chrome-extension/manifest.json" with { type: "json" };
import extensionPackage from "../apps/chrome-extension/package.json" with { type: "json" };
import serverPackage from "../apps/mcp-server/package.json" with { type: "json" };
import workspacePackage from "../package.json" with { type: "json" };
import { extensionArtifactPolicy, serverArtifactPolicy } from "./publicArtifactPolicies.ts";
import { verifyPublicArtifact } from "./verifyPublicArtifact.ts";

const { version } = workspacePackage;
const versions = [extensionManifest.version, extensionPackage.version, serverPackage.version, process.env.GALPI_RELEASE_VERSION ?? version];
if (!/^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)$/.test(version) || versions.some((value) => value !== version)) {
  throw new Error("태그, 워크스페이스, 갈피와 MCP의 버전이 같아야 합니다.");
}

const execute = promisify(execFile);
const root = resolve(".artifacts");
await mkdir(root, { recursive: true });
const directory = await mkdtemp(join(root, "public-"));
const extension = join(directory, `갈피.${version}.zip`);
await execute("zip", ["-qDry", extension, "."], {
  cwd: resolve("apps/chrome-extension/dist")
});
const extensionResult = await verifyPublicArtifact(extension, extensionArtifactPolicy);
if (!extensionResult.ok) throw new Error(`Chrome 확장 패키지 검사 실패: ${extensionResult.error}`);

if (!process.argv.includes("--extension-only")) {
  const server = join(directory, "server");
  await mkdir(server);
  await execute("pnpm", ["--dir", "apps/mcp-server", "pack", "--pack-destination", server]);
  const archives = (await readdir(server)).filter((file) => file.endsWith(".tgz"));
  if (archives.length !== 1) throw new Error("서버 패키지 하나가 필요합니다.");
  const serverResult = await verifyPublicArtifact(join(server, archives[0]), serverArtifactPolicy);
  if (!serverResult.ok) throw new Error(`서버 패키지 검사 실패: ${serverResult.error}`);
}

console.log(`공개 산출물 검사 통과: ${directory}`);
