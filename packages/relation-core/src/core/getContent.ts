import * as fs from "node:fs";
import * as path from "node:path";
import GitServer from "./GitServer.js";

export const getContent = async ({
  workingDirectory,
  rev,
  fileBaseDir,
  filePath,
}) => {
  if (!rev) {
    return fs
      .readFileSync(path.join(workingDirectory, fileBaseDir, filePath))
      .toString();
  }

  const parsedBaseRev = await GitServer.singleton().parseRev(
    workingDirectory,
    rev,
    fileBaseDir
  );

  return GitServer.singleton().show(
    workingDirectory,
    parsedBaseRev,
    fileBaseDir,
    filePath
  );
};
