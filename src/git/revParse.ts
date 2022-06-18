import { spawnSync } from "node:child_process";
import { getCwd } from "./getCwd.js";

export function revParse(rev, isSrc?: boolean) {
  const cwd = getCwd(isSrc);

  const result = spawnSync("git", ["rev-parse", `${rev}`], {
    cwd,
  });

  return result.stdout.toString().trim();
}
