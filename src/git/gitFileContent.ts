import { spawnSync } from "node:child_process";
import path, { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getFileContent(rev, path) {
  let cwd = process.cwd();

  if (process.env.NODE_ENV === "test") {
    cwd = join(__dirname, "../../tests/relation-test-repo");
  }

  const result = spawnSync("git", ["show", `${rev}:${path}`], {
    cwd,
  });

  return result.stdout.toString();
}
