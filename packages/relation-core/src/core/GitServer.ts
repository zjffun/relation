import path from "path";
import simpleGit from "simple-git";
import getDirnameBasename from "./getDirnameBasename.js";

let singleton: GitServer = null;

export default class GitServer {
  public showMap = new Map<string, string>();
  public revMap = new Map<string, string>();

  async parseRev(workingDirectory, revision, filePath) {
    const key = `${revision}:${filePath}`;

    let result = this.revMap.get(key);

    if (result !== undefined) {
      return result;
    }

    const [dirName] = getDirnameBasename(path.join(workingDirectory, filePath));

    const simpleGitInstance = simpleGit(dirName);

    result = (await simpleGitInstance.raw("rev-parse", revision)).trim();

    this.revMap.set(key, result);

    return result;
  }

  async show(workingDirectory, parsedRevision, filePath) {
    const key = `${parsedRevision}:${filePath}`;

    let result = this.showMap.get(key);

    if (result !== undefined) {
      return result;
    }

    const [dirName, baseName] = getDirnameBasename(
      path.join(workingDirectory, filePath)
    );

    const simpleGitInstance = simpleGit(dirName);

    result = await simpleGitInstance.show([`${parsedRevision}:./${baseName}`]);

    this.showMap.set(key, result);

    return result;
  }

  static singleton() {
    if (!singleton) {
      singleton = new GitServer();
    }
    return singleton;
  }
}
