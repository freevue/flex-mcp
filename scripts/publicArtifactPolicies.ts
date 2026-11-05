import type { PublicArtifactPolicy } from "./verifyPublicArtifact.ts";

const shared = ["contracts", "index", "shiftDate", "validation"].map(name => `shared/${name}.js`);
const server = [
  "index", "dates", "createMcpServer", "createCallerMcpServer",
  "access/authorizeMcpCaller", "access/index", "access/resolveBrowserBinding", "access/revokeAccess", "access/types",
  "bridge/attachBrowserBridge", "bridge/forwardFlexQuery", "bridge/index", "bridge/parseBridgeReply", "bridge/types",
  "operations/index", "operations/getServiceReadiness",
].map(name => `apps/mcp-server/src/${name}.js`);
const extension = [
  "service-worker",
  "bridge/confirmBrowserBinding", "bridge/connectBridge", "bridge/deriveConnectionState", "bridge/dispatchToFlexTab",
  "bridge/findFlexTab", "bridge/index", "bridge/parseBridgeRequest",
  "flex/index", "flex/parseAnnualLeave", "flex/readAnnualLeave", "flex/readCurrentUser", "flex/readFlexJson",
  "flex/readSchedule", "flex/readWorkHours", "flex/runFlexQuery", "flex/types",
].map(name => `apps/chrome-extension/src/${name}.js`);
const serverEntries = ["package/package.json", ...["index.js", ...server, ...shared].map(path => `package/dist/${path}`)];
const extensionEntries = ["manifest.json", "service-worker.js", ...extension, ...shared];

export const serverArtifactPolicy: PublicArtifactPolicy = {
  format: "tgz",
  required: serverEntries,
  allowed: new Set([...serverEntries, "package/README.md"]),
};
export const extensionArtifactPolicy: PublicArtifactPolicy = {
  format: "zip",
  required: extensionEntries,
  allowed: new Set(extensionEntries),
};
