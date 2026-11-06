import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { checkPairedChannels } from "./checkPairedChannels.ts";

test("로컬 Workers에서 사전 등록 없이 두 확장의 소켓과 조회를 분리한다", { timeout: 25_000 }, async context => {
  const root = fileURLToPath(new URL("../../../", import.meta.url));
  const local = join(root, ".local");
  mkdirSync(local, { recursive: true });
  const folder = mkdtempSync(join(local, "worker-test-"));
  const reservation = createServer().listen(0, "127.0.0.1");
  await once(reservation, "listening");
  const address = reservation.address();
  assert.ok(address && typeof address !== "string");
  const { port } = address;
  await new Promise<void>(resolve => reservation.close(() => resolve()));
  const origin = `http://127.0.0.1:${port}`;
  const worker = spawn(process.execPath, [join(root, "node_modules/wrangler/bin/wrangler.js"), "dev", "--env", "staging",
    "--ip", "127.0.0.1", "--port", String(port), "--persist-to", join(folder, "state")], {
    cwd: root, env: { ...process.env, WRANGLER_SEND_METRICS: "false" }, stdio: ["ignore", "pipe", "pipe"],
  });
  const exited = once(worker, "exit");
  let diagnostics = "";
  const keepDiagnostics = (data: Buffer) => { diagnostics = `${diagnostics}${data.toString("utf8")}`.slice(-2_000); };
  worker.stdout.on("data", keepDiagnostics);
  worker.stderr.on("data", keepDiagnostics);
  context.after(async () => {
    worker.kill("SIGTERM");
    await Promise.race([exited, delay(1_500)]);
    rmSync(folder, { recursive: true, force: true });
  });
  let live = false;
  for (let attempt = 0; attempt < 50 && worker.exitCode === null; attempt++) {
    live = (await fetch(`${origin}/mcp`).catch(() => null))?.status === 405;
    if (live) break;
    await delay(100);
  }
  assert.ok(live, diagnostics);
  await checkPairedChannels(origin);
});
