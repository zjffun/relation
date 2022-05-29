import { spawnSync } from "node:child_process";
import { join } from "node:path";

export function getFileContent(commitid, filePath) {
  let cwd = process.cwd();

  if (process.env.NODE_ENV === "test") {
    cwd = join(__dirname, "../tests/repository");
  }

  const result = spawnSync("git", ["show", `${commitid}:${filePath}`], {
    cwd: cwd,
  });

  return result.stdout.toString();
}
