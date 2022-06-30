import { join } from "node:path";
import { IOptions } from "../checkRelations.js";
import { getConfig } from "./getConfig.js";

export function getInfo(options: IOptions) {
  let cwd = process.cwd();

  if (options?.cwd) {
    cwd = options.cwd;
  }

  const config = getConfig(cwd);

  let srcCwd = cwd;

  if (config.srcSubmoduleRelativePath) {
    srcCwd = join(cwd, config.srcSubmoduleRelativePath);
  }

  if (!config.baseRev) {
    config.baseRev = "@";
  }

  return {
    cwd,
    srcCwd,
    config,
  };
}
