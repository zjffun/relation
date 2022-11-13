import path from "path";
import simpleGit from "simple-git";

let singleton: GitServer = null;

export default class GitServer {
  public showMap = new Map<string, string>();
  public revMap = new Map<string, string>();

  async show(
    workingDirectory,
    parsedRevision,
    gitWorkingDirectory = "",
    filePath
  ) {
    const key = `${parsedRevision}:${filePath}`;

    let result = this.showMap.get(key);

    if (result !== undefined) {
      return result;
    }

    const simpleGitInstance = simpleGit(
      path.join(workingDirectory, gitWorkingDirectory)
    );

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

  static async parseRev(revision, absoluteGitWorkingDirectory) {
    if (revision === undefined) {
      return revision;
    }

    const simpleGitInstance = simpleGit(absoluteGitWorkingDirectory);

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
