import { join } from "node:path";
import { IOptions } from "../types.js";
import { getConfig } from "./getConfig.js";

export function getInfo(options: IOptions) {
  let cwd = process.cwd();

  if (options?.cwd) {
    cwd = options.cwd;
  }

  // working directory, like `git -C <path>`
  const workingDirectory = cwd;

  const relationFilePath = join(workingDirectory, ".relation", "relation.json");

  const config = getConfig(cwd);

  return {
    cwd,
    workingDirectory,
    relationFilePath,
    config,
  };
}
