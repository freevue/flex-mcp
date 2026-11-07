import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { once } from "node:events";
import { cp, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { chromium, type BrowserContext } from "playwright";
import { isRecord } from "../../../shared/index.ts";
import { openStateDatabase } from "../src/registration/index.ts";
import { createRemoteServer } from "../src/remote/index.ts";
import { checkDashboardFixtures } from "./checkDashboardFixtures.ts";

test("FT-GALPI-DASHBOARD-01~03: Chromium에서 승인, 근무 비교, 연결 상태와 키보드를 확인한다", { timeout: 60_000 }, async (context) => {
  const root = fileURLToPath(new URL("../../../", import.meta.url));
  const folder = await mkdtemp(join(tmpdir(), "flex-browser-e2e-"));
  const extension = join(folder, "extension");
  const database = openStateDatabase(":memory:");
  const server = createRemoteServer({ origin: "http://127.0.0.1" }, database);
  const client = new Client({ name: "flex-browser-e2e", version: "1" });
  let browser: BrowserContext | undefined;
  context.after(async () => {
    await browser?.close();
    await client.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    database.close();
    await rm(folder, { recursive: true, force: true });
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const origin = `http://127.0.0.1:${address.port}`;
  await promisify(execFile)("pnpm", ["build:extension"], {
    cwd: root,
    env: {
      ...process.env,
      FLEX_EXTENSION_SERVER_URL: "http://127.0.0.1:8787",
      FLEX_EXTENSION_DEMO: "1"
    },
    timeout: 20_000
  });
  await cp(join(root, "apps/chrome-extension/dist"), extension, {
    recursive: true
  });
  await writeFile(join(extension, "extension-config.json"), JSON.stringify({ origin, demo: true }));

  browser = await chromium.launchPersistentContext(join(folder, "profile"), {
    channel: "chromium",
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    timeout: 15_000
  });
  browser.setDefaultTimeout(12_000);
  const worker = browser.serviceWorkers()[0] ?? (await browser.waitForEvent("serviceworker"));
  const popup = await browser.newPage();
  const popupUrl = `chrome-extension://${new URL(worker.url()).host}/popup.html`;
  await popup.goto(popupUrl);
  const approvalCode = await popup.locator(".approval-code").textContent();
  assert.match(approvalCode ?? "", /^[A-F0-9]{4}(?:-[A-F0-9]{4}){2}$/);
  assert.equal(await popup.getByRole("heading", { name: "승인 대기" }).isVisible(), true, "UT-renderApprovalCode-01");
  assert.equal(await popup.getByRole("button", { name: "코드 복사" }).isVisible(), true, "UT-renderUnavailablePopup-02");
  assert.equal(await popup.getByRole("heading", { name: "오늘 실제 근무" }).count(), 0);

  await client.connect(new StreamableHTTPClientTransport(new URL("/mcp", origin)));
  const approval = await client.callTool({
    name: "flex_approve_connection",
    arguments: { approvalCode }
  });
  const data = approval.structuredContent;
  assert.ok(isRecord(data) && data.status === "approved" && typeof data.connectionKey === "string");
  const connection = { connectionKey: data.connectionKey };
  await popup.getByText("합성 모드", { exact: true }).waitFor();
  assert.deepEqual(await popup.locator(".connection-rows dd").allTextContents(), ["연결됨", "합성 모드"], "UT-renderConnectionRows-01");
  await popup.getByRole("heading", { name: "오늘 실제 근무" }).waitFor();
  assert.deepEqual(await popup.locator(".work section h2").allTextContents(), ["오늘 실제 근무", "이번 달 인정 근무", "이번 달 남은 시간"]);
  assert.deepEqual(await popup.locator(".work-month dt").allTextContents(), ["연차 포함", "연차 미포함"]);
  assert.deepEqual(await popup.locator(".work-remaining dt").allTextContents(), ["놀수 미반영", "놀수 반영"]);
  const status = await client.callTool({
    name: "flex_get_socket_status",
    arguments: connection
  });
  assert.deepEqual(status.structuredContent, { status: "online" });
  const result = await client.callTool({
    name: "flex_get_annual_leave",
    arguments: connection
  });
  assert.equal(result.isError, undefined);
  const summary = await client.callTool({ name: "flex_get_work_summary", arguments: connection });
  assert.equal(summary.isError, undefined);
  const details = summary.structuredContent;
  assert.ok(isRecord(details) && details.synthetic === true && details.todayActualMinutes === 320);
  assert.equal(details.monthAnnualLeaveScheduledRecognizedMinutes, 0);
  assert.equal(await popup.locator(".work-today strong").textContent(), "5시간 20분");
  const codeButton = popup.getByRole("button", { name: "코드 확인" });
  await codeButton.focus();
  await popup.keyboard.press("Enter");
  await popup.locator("#code-popover").waitFor();
  await popup.keyboard.press("Escape");
  await popup.locator("#code-popover").waitFor({ state: "hidden" });
  assert.equal(await codeButton.evaluate((button) => document.activeElement === button), true);
  const fits = await popup.locator(".work").evaluate((panel) => {
    document.documentElement.style.fontSize = "22px";
    return panel.scrollWidth === panel.clientWidth;
  });
  assert.equal(fits, true);
  assert.ok(isRecord(result.structuredContent) && result.structuredContent.synthetic === true);
  await checkDashboardFixtures(await browser.newPage(), popupUrl);
});
