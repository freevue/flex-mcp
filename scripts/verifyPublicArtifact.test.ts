import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import { verifyPublicArtifact } from "./verifyPublicArtifact.ts";

const execute = promisify(execFile);

test("ZIP과 tar를 열지 않고 필수 파일, 금지 파일, 경로, 링크를 검사한다", async context => {
  const cwd = await mkdtemp(join(tmpdir(), "flex-artifact-test-"));
  context.after(() => rm(cwd, { recursive: true, force: true }));
  await writeFile(join(cwd, "manifest.json"), "{}");
  await writeFile(join(cwd, ".env.example"), "EXAMPLE=synthetic");
  await symlink("manifest.json", join(cwd, "link.json"));
  const policy = { format: "zip", required: ["manifest.json"], allowed: new Set(["manifest.json", "link.json"]) } as const;
  for (const [archive, files, expected] of [
    ["valid.zip", ["manifest.json"], { ok: true }],
    ["missing.zip", ["link.json"], { ok: false, error: "REQUIRED_ENTRY_MISSING" }],
    ["forbidden.zip", ["manifest.json", ".env.example"], { ok: false, error: "FORBIDDEN_ENTRY" }],
  ] as const) {
    await execute("zip", ["-q", archive, ...files], { cwd });
    assert.deepEqual(await verifyPublicArtifact(join(cwd, archive), policy), expected);
  }
  await execute("zip", ["-qy", "link.zip", "manifest.json", "link.json"], { cwd });
  assert.deepEqual(await verifyPublicArtifact(join(cwd, "link.zip"), policy), { ok: false, error: "FORBIDDEN_ENTRY" });
  await execute("tar", ["-czf", "valid.tgz", "manifest.json"], { cwd });
  assert.deepEqual(await verifyPublicArtifact(join(cwd, "valid.tgz"), { ...policy, format: "tgz" }), { ok: true });
  const bytes = Buffer.from("../escape.json");
  await writeFile(join(cwd, "safe-file.json"), "{}");
  await execute("zip", ["-q", "traversal.zip", "safe-file.json"], { cwd });
  const archive = join(cwd, "traversal.zip");
  const data = await readFile(archive);
  const path = Buffer.from("safe-file.json");
  assert.equal(bytes.length, path.length);
  for (let offset = data.indexOf(path); offset !== -1; offset = data.indexOf(path, offset + path.length)) {
    bytes.copy(data, offset);
  }
  await writeFile(archive, data);
  assert.deepEqual(await verifyPublicArtifact(archive, policy), { ok: false, error: "FORBIDDEN_ENTRY" });
});
