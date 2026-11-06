import type { PublicArtifactPolicy } from "./verifyPublicArtifact.ts";

const shared = ["bridgeOrigin", "contracts", "index", "shiftDate", "validation"].map(name => `shared/${name}.js`);
const server = [
  "index", "dates", "createMcpServer", "createCallerMcpServer",
  "access/authorizeMcpCaller", "access/index", "access/resolveBrowserBinding", "access/revokeAccess", "access/types",
  "bridge/attachBrowserBridge", "bridge/forwardFlexQuery", "bridge/index", "bridge/parseBridgeReply", "bridge/types",
  "operations/index", "operations/getServiceReadiness",
  "registration/accessState", "registration/admin", "registration/agentKeys", "registration/bridgeTickets",
  "registration/database", "registration/index", "registration/pairing",
  "remote/browserSocket", "remote/createRemoteServer", "remote/demoQuery", "remote/http", "remote/index",
  "remote/registrationHttp", "remote/start",
].map(name => `apps/mcp-server/src/${name}.js`);
const extension = [
  "options", "service-worker",
  "registration/bridgeApi", "registration/index",
  "bridge/confirmBrowserBinding", "bridge/connectBridge", "bridge/deriveConnectionState", "bridge/dispatchToFlexTab",
  "bridge/findFlexTab", "bridge/index", "bridge/parseBridgeRequest", "bridge/syntheticReply",
  "flex/index", "flex/parseAnnualLeave", "flex/readAnnualLeave", "flex/readCurrentUser", "flex/readFlexJson",
  "flex/readSchedule", "flex/readWorkHours", "flex/runFlexQuery", "flex/types",
].map(name => `apps/chrome-extension/src/${name}.js`);
const serverEntries = ["package/package.json", ...["index.js", ...server, ...shared].map(path => `package/dist/${path}`)];
const extensionEntries = ["manifest.json", "options.html", "service-worker.js", ...extension, ...shared];

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
