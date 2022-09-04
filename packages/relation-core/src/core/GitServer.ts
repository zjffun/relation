import path from "path";
import simpleGit from "simple-git";

let singleton: GitServer = null;

export default class GitServer {
  public showMap = new Map<string, string>();
  public revMap = new Map<string, string>();

  async parseRev(workingDirectory, revision, baseDir) {
    const key = `${revision}:${baseDir}`;

    let result = this.revMap.get(key);

    if (result !== undefined) {
      return result;
    }

    const simpleGitInstance = simpleGit(path.join(workingDirectory, baseDir));

    result = (await simpleGitInstance.raw("rev-parse", revision)).trim();

    this.revMap.set(key, result);

    return result;
  }

  async show(workingDirectory, parsedRevision, baseDir, filePath) {
    const key = `${parsedRevision}:${filePath}`;

    let result = this.showMap.get(key);

    if (result !== undefined) {
      return result;
    }

    const simpleGitInstance = simpleGit(path.join(workingDirectory, baseDir));

    try {
      result = await simpleGitInstance.show([
        `${parsedRevision}:./${filePath}`,
      ]);
    } catch (error) {
      console.error(error);
      result = "";
    }

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
