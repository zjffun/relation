import { Change, diffLines } from "diff";
import { fixChanges } from "./fixChanges.js";
import GitServer from "./GitServer.js";

let singleton: ChangeServer;

export default class ChangeServer {
  public fixedChangesMap = new Map<string, Change[]>();

  private gitServer: GitServer;

  constructor(gitServer) {
    this.gitServer = gitServer;
  }

  async getFixedChanges(
    workingDirectory,
    parsedRevision1,
    parsedRevision2,
    baseDir,
    filePath
  ) {
    const key = `${parsedRevision1}:${parsedRevision2}:${baseDir}:${filePath}`;

    let result = this.fixedChangesMap.get(key);

    if (result !== undefined) {
      return result;
    }

    const content1 = await this.gitServer.show(
      workingDirectory,
      parsedRevision1,
      baseDir,
      filePath
    );

    const content2 = await this.gitServer.show(
      workingDirectory,
      parsedRevision2,
      baseDir,
      filePath
    );

    result = fixChanges(diffLines(content1, content2));

    this.fixedChangesMap.set(key, result);

    return result;
  }

  static singleton() {
    if (!singleton) {
      singleton = new ChangeServer(GitServer.singleton());
    }
    return singleton;
  }
}
