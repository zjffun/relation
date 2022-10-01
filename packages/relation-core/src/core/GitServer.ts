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

    result = await GitServer.parseRev(workingDirectory, revision, baseDir);

    if (result !== undefined) {
      this.revMap.set(`${result}:${baseDir}`, result);
    }

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

    if (parsedRevision !== ":0") {
      this.showMap.set(key, result);
    }

    return result;
  }

  static async parseRev(workingDirectory, revision, baseDir) {
    if (revision === undefined) {
      return revision;
    }

    const simpleGitInstance = simpleGit(path.join(workingDirectory, baseDir));

    const result = (await simpleGitInstance.raw("rev-parse", revision)).trim();

    return result;
  }

  static singleton() {
    if (!singleton) {
      singleton = new GitServer();
    }
    return singleton;
  }
}
