import fse from "fs-extra";
import * as path from "node:path";
import GitServer from "./GitServer.js";
import { sha1 } from "./sha1.js";

export const getContent = async (info) => {
  const {
    workingDirectory,
    path: filePath,
    contentRev,
    gitRev,
    gitWorkingDirectory,
  } = info;

  if (gitRev) {
    const content = await GitServer.singleton().show(
      workingDirectory,
      gitRev,
      gitWorkingDirectory,
      filePath
    );
    return [sha1(content), content];
  }

  if (contentRev) {
    const content = fse
      .readFileSync(path.join(workingDirectory, "contents", contentRev))
      .toString();
    return [contentRev, content];
  }

  const content = fse
    .readFileSync(path.join(workingDirectory, filePath), "utf8")
    .toString();
  return [sha1(content), content];
};
