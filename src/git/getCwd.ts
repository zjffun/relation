import { spawnSync } from "node:child_process";
import path, { join } from "node:path";
import { fileURLToPath } from "node:url";
import { getConfig } from "../core/getConfig.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getCwd(isSrc?: boolean) {
  const config = getConfig();

  let cwd = process.cwd();

  if (process.env.NODE_ENV === "test") {
    cwd = join(__dirname, "../../tests/relation-test-repo");
  }

  if (isSrc && config.srcSubmoduleRelativePath) {
    join(cwd, config.srcSubmoduleRelativePath);
  }

  return cwd;
}
