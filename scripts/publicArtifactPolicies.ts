import type { PublicArtifactPolicy } from "./verifyPublicArtifact.ts";

const shared = ["bridgeOrigin", "contracts", "index", "shiftDate", "validation"].map(name => `shared/${name}.js`);
const server = [
  "index", "dates", "createMcpServer", "createCallerMcpServer", "createPairedMcpServer",
  "access/authorizeMcpCaller", "access/index", "access/resolveBrowserBinding", "access/revokeAccess", "access/types",
  "bridge/attachBrowserBridge", "bridge/forwardFlexQuery", "bridge/index", "bridge/parseBridgeReply", "bridge/types",
  "operations/index", "operations/getServiceReadiness", "operations/getBrowserConnectionStatus",
  "registration/accessState", "registration/admin", "registration/agentKeys", "registration/bridgeTickets",
  "registration/database", "registration/devicePairing", "registration/index", "registration/pairing", "registration/stateDatabase",
  "remote/browserSocket", "remote/createRemoteServer", "remote/demoQuery", "remote/http", "remote/index",
  "remote/registrationHttp", "remote/start",
].map(name => `apps/mcp-server/src/${name}.js`);
const extension = [
  "extensionConfiguration", "popup", "service-worker",
  "popup/components", "popup/formatWorkMinutes", "popup/index", "popup/readPopupSnapshot", "popup/types",
  "registration/bridgeApi", "registration/devicePairingApi", "registration/index", "registration/pairingSession",
  "bridge/confirmBrowserBinding", "bridge/connectBridge", "bridge/deriveConnectionState", "bridge/dispatchToFlexTab",
  "bridge/findFlexTab", "bridge/index", "bridge/parseBridgeRequest", "bridge/syntheticReply",
  "flex/demoWorkSummary", "flex/workSummary", "flex/index", "flex/parseAnnualLeave", "flex/readAnnualLeave", "flex/readCurrentUser", "flex/readFlexJson",
  "flex/readSchedule", "flex/readWorkHours", "flex/runFlexQuery", "flex/types",
].map(name => `apps/chrome-extension/src/${name}.js`);
const serverEntries = ["package/package.json", ...["index.js", ...server, ...shared].map(path => `package/dist/${path}`)];
const extensionIcons = ["logo.svg", "icon-16.png", "icon-32.png", "icon-48.png", "icon-128.png"].map(name => `icons/${name}`);
const extensionEntries = [
  "manifest.json", "extension-config.json", "popup.html", "popup.css", "service-worker.js", ...extensionIcons, ...extension, ...shared,
];

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
