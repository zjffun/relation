import { spawnSync } from "node:child_process";
import { getCwd } from "./getCwd.js";

export function getFileContent(rev, path, isSrc?: boolean) {
  const cwd = getCwd(isSrc);

  const result = spawnSync("git", ["show", `${rev}:${path}`], {
    cwd,
  });

  return result.stdout.toString();
}
