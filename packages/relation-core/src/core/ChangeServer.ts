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

  getFixedChanges(content1, content2) {
    const result = fixChanges(diffLines(content1, content2));

    return result;
  }

  static singleton() {
    if (!singleton) {
      singleton = new ChangeServer(GitServer.singleton());
    }
    return singleton;
  }
}
