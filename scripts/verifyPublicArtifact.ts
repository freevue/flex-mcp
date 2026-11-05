import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { promisify } from "node:util";

const execute = promisify(execFile);

export type PublicArtifactPolicy = {
  format: "tgz" | "zip";
  required: readonly string[];
  allowed: ReadonlySet<string>;
};
export type ArtifactCheckResult = { ok: true } | {
  ok: false;
  error: "ARCHIVE_UNREADABLE" | "FORBIDDEN_ENTRY" | "REQUIRED_ENTRY_MISSING";
};

function isPath(value: string): boolean {
  return value.split("/").every(segment => /^[A-Za-z0-9_-][A-Za-z0-9_.-]*$/.test(segment));
}

export async function verifyPublicArtifact(archivePath: string, policy: PublicArtifactPolicy):
  Promise<ArtifactCheckResult> {
  const file = resolve(archivePath);
  const tar = policy.format === "tgz";
  const command = tar ? "tar" : "unzip";
  try {
    const names = await execute(command, tar ? ["-tzf", file] : ["-Z", "-1", file]);
    const details = await execute(command, tar ? ["-tvzf", file] : ["-Z", "-l", file]);
    const paths = names.stdout.replace(/\n$/, "").split("\n");
    const modes = details.stdout.split("\n").filter(line => tar ? line.length > 0 : /^[?bcdlps-][rwxstST?-]{9}\s/.test(line));
    const entries = new Set(paths);
    if (names.stderr || details.stderr || modes.length !== paths.length || entries.size !== paths.length
      || modes.some(line => !line.startsWith("-"))
      || paths.some(path => !isPath(path) || !policy.allowed.has(path))) return { ok: false, error: "FORBIDDEN_ENTRY" };
    if (policy.required.some(path => !entries.has(path))) return { ok: false, error: "REQUIRED_ENTRY_MISSING" };
    return { ok: true };
  } catch {
    return { ok: false, error: "ARCHIVE_UNREADABLE" };
  }
}
