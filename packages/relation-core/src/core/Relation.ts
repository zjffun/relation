import fse from "fs-extra";
import * as path from "node:path";
import simpleGit from "simple-git";
import { IRawRelation, IViewerContents, IViewerRelation } from "../types.js";
import ChangeServer from "./ChangeServer.js";
import { checkDirty } from "./checkDirty.js";
import getDirnameBasename from "./getDirnameBasename.js";
import GitServer from "./GitServer.js";
import { sha1 } from "./sha1.js";

interface IRelationInfo extends Partial<IRawRelation> {
  workingDirectory?: string;
}

export enum RelationRevType {
  content = "content",
  git = "git",
}

class Relation {
  public id = undefined;
  public fromRange: [number, number] = undefined;
  public toRange: [number, number] = undefined;
  public fromPath = undefined;
  public toPath = undefined;
  public fromContentRev = undefined;
  public toContentRev = undefined;
  public fromGitRev = undefined;
  public toGitRev = undefined;
  public fromGitWorkingDirectory = undefined;
  public toGitWorkingDirectory = undefined;
  public workingDirectory = undefined;

  constructor(relationInfo: IRelationInfo = {}) {
    this.id = relationInfo.id;
    this.fromRange = relationInfo.fromRange;
    this.toRange = relationInfo.toRange;
    this.fromPath = relationInfo.fromPath;
    this.toPath = relationInfo.toPath;
    this.fromContentRev = relationInfo.fromContentRev;
    this.toContentRev = relationInfo.toContentRev;
    this.fromGitRev = relationInfo.fromGitRev;
    this.toGitRev = relationInfo.toGitRev;
    this.fromGitWorkingDirectory = relationInfo.fromGitWorkingDirectory;
    this.toGitWorkingDirectory = relationInfo.toGitWorkingDirectory;
    this.workingDirectory = relationInfo.workingDirectory;
  }

  get fromRevType() {
    if (this.fromGitRev) {
      return RelationRevType.git;
    }

    if (this.fromContentRev) {
      return RelationRevType.content;
    }
  }

  get toRevType() {
    if (this.toGitRev) {
      return RelationRevType.git;
    }

    if (this.toContentRev) {
      return RelationRevType.content;
    }
  }

  get fromAbsolutePath() {
    const absolutePath = this.getAbsolutePath(this.fromPath);
    return absolutePath;
  }

  set fromAbsolutePath(absolutePath: string) {
    this.fromPath = this.getRelativePath(absolutePath);
    this.fromGitWorkingDirectory = undefined;
  }

  get toAbsolutePath() {
    const absolutePath = this.getAbsolutePath(this.toPath);
    return absolutePath;
  }

  set toAbsolutePath(absolutePath: string) {
    this.toPath = this.getRelativePath(absolutePath);
    this.toGitWorkingDirectory = undefined;
  }

  get fromGitWorkingDirectoryString() {
    if (!this.fromGitWorkingDirectory) {
      return "";
    }

    return this.fromGitWorkingDirectory;
  }

  get toGitWorkingDirectoryString() {
    if (!this.toGitWorkingDirectory) {
      return "";
    }

    return this.toGitWorkingDirectory;
  }

  get fromAbsoluteGitWorkingDirectory() {
    const absolutePath = this.getAbsolutePath(
      this.fromGitWorkingDirectoryString
    );
    return absolutePath;
  }

  get toAbsoluteGitWorkingDirectory() {
    const absolutePath = this.getAbsolutePath(this.toGitWorkingDirectoryString);
    return absolutePath;
  }

  get fromRelativeGitPath() {
    const relativePath = path.relative(
      this.fromAbsoluteGitWorkingDirectory,
      this.fromAbsolutePath
    );
    return relativePath;
  }

  get toRelativeGitPath() {
    const relativePath = path.relative(
      this.toAbsoluteGitWorkingDirectory,
      this.toAbsolutePath
    );
    return relativePath;
  }

  get fromCurrentContent() {
    const content = fse.readFileSync(this.fromAbsolutePath).toString();

    return content;
  }

  get toCurrentContent() {
    const content = fse.readFileSync(this.toAbsolutePath).toString();

    return content;
  }

  async getFromGitContent(rev: string) {
    const absolutePath = this.fromAbsolutePath;
    const absoluteGitWorkingDirectory = await this.getAbsoluteGitWorkingDirectory(
      absolutePath
    );
    const content = await this.getGitContent({
      rev,
      absoluteGitWorkingDirectory,
      relativeGitPath: path.relative(absoluteGitWorkingDirectory, absolutePath),
      safe: true,
    });

    return content;
  }

  async getToGitContent(rev: string) {
    const absolutePath = this.toAbsolutePath;
    const absoluteGitWorkingDirectory = await this.getAbsoluteGitWorkingDirectory(
      absolutePath
    );
    const content = await this.getGitContent({
      rev,
      absoluteGitWorkingDirectory,
      relativeGitPath: path.relative(absoluteGitWorkingDirectory, absolutePath),
      safe: true,
    });

    return content;
  }

  async getFromOriginalContent() {
    if (this.fromRevType === RelationRevType.git) {
      const content = await this.getGitContent({
        rev: this.fromGitRev,
        absoluteGitWorkingDirectory: this.fromAbsoluteGitWorkingDirectory,
        relativeGitPath: this.fromRelativeGitPath,
        safe: true,
      });

      return content;
    }

    if (this.fromRevType === RelationRevType.content) {
      const content = this.getContentSafe(this.fromContentRev);
      return content;
    }
  }

  async getToOriginalContent() {
    if (this.toRevType === RelationRevType.git) {
      const content = await this.getGitContent({
        rev: this.toGitRev,
        absoluteGitWorkingDirectory: this.toAbsoluteGitWorkingDirectory,
        relativeGitPath: this.toRelativeGitPath,
        safe: true,
      });

      return content;
    }

    if (this.toRevType === RelationRevType.content) {
      const content = this.getContentSafe(this.toContentRev);
      return content;
    }
  }

  getContent(contentRev: string) {
    const content = fse
      .readFileSync(
        path.join(this.workingDirectory, ".relation", "contents", contentRev)
      )
      .toString();

    return content;
  }

  getContentSafe(contentRev: string) {
    let content = "";

    try {
      content = this.getContent(contentRev);
    } catch (error) {
      console.error(error);
    }

    return content;
  }

  async getGitContent({
    absoluteGitWorkingDirectory,
    rev,
    relativeGitPath,
    safe,
  }: {
    absoluteGitWorkingDirectory: string;
    rev: string;
    relativeGitPath: string;
    safe?: boolean;
  }) {
    let content = "";

    try {
      const simpleGitInstance = simpleGit(absoluteGitWorkingDirectory);
      content = await simpleGitInstance.show([`${rev}:${relativeGitPath}`]);
    } catch (error) {
      if (!safe) {
        throw error;
      }

      console.error(error);
    }

    return content;
  }

  getRelativePath(absolutePath: string) {
    const relativePath = path.relative(this.workingDirectory, absolutePath);
    return relativePath;
  }

  getAbsolutePath(relativePath: string) {
    const absolutePath = path.join(this.workingDirectory, relativePath);
    return absolutePath;
  }

  setFromContent(content: string) {
    const rev = this.addContent(content);

    this.fromContentRev = rev;
    this.fromGitRev = undefined;
    this.fromGitWorkingDirectory = undefined;
  }

  setToContent(content: string) {
    const rev = this.addContent(content);

    this.toContentRev = rev;
    this.toGitRev = undefined;
    this.toGitWorkingDirectory = undefined;
  }

  async setFromGitInfo({ rev }) {
    const absoluteGitWorkingDirectory = await this.getAbsoluteGitWorkingDirectory(
      this.fromAbsolutePath
    );

    this.fromGitWorkingDirectory =
      this.getRelativePath(absoluteGitWorkingDirectory) || undefined;

    this.fromGitRev = await this.parseRev(rev, absoluteGitWorkingDirectory);

    this.fromContentRev = undefined;
  }

  async setToGitInfo({ rev }) {
    const absoluteGitWorkingDirectory = await this.getAbsoluteGitWorkingDirectory(
      this.toAbsolutePath
    );

    this.toGitWorkingDirectory =
      this.getRelativePath(absoluteGitWorkingDirectory) || undefined;

    this.toGitRev = await this.parseRev(rev, absoluteGitWorkingDirectory);

    this.toContentRev = undefined;
  }

  async getAbsoluteGitWorkingDirectory(filePath: string) {
    const [dirname] = getDirnameBasename(filePath);
    const git = simpleGit(dirname);
    const rootDir = await git.revparse(["--show-toplevel"]);
    const realDirname = await fse.realpath(dirname);
    const relative = path.relative(realDirname, rootDir);
    const absoluteGitWorkingDirectory = path.join(dirname, relative);

    return absoluteGitWorkingDirectory;
  }

  async parseRev(rev: string, absoluteGitWorkingDirectory: string) {
    const parsedRev = await GitServer.parseRev(
      rev,
      absoluteGitWorkingDirectory
    );
    return parsedRev;
  }

  addContent(content: string) {
    const rev = sha1(content);

    const filePath = path.join(
      this.workingDirectory,
      ".relation",
      "contents",
      rev
    );

    if (!fse.existsSync(filePath)) {
      fse.ensureFileSync(filePath);
      fse.writeFileSync(filePath, content);
    }

    return rev;
  }

  toJSON(): IRawRelation {
    const obj = {
      id: this.id,
      fromPath: this.fromPath,
      toPath: this.toPath,
      fromRange: this.fromRange,
      toRange: this.toRange,
      fromGitRev: this.fromGitRev,
      toGitRev: this.toGitRev,
      fromGitWorkingDirectory: this.fromGitWorkingDirectory,
      toGitWorkingDirectory: this.toGitWorkingDirectory,
      fromContentRev: this.fromContentRev,
      toContentRev: this.toContentRev,
    };

    return obj;
  }

  async autoSetFromRev({ gitRev }: { gitRev?: string } = {}) {
    const currentGitRev = gitRev || "@";
    const gitContent = await this.getFromGitContent(currentGitRev);
    const currentContent = this.fromCurrentContent;

    const changes = ChangeServer.singleton().getFixedChanges(
      gitContent,
      currentContent
    );

    const dirty = checkDirty({
      changes: changes,
      range: this.fromRange,
    });

    if (dirty) {
      this.setFromContent(currentContent);
    } else {
      await this.setFromGitInfo({ rev: currentGitRev });
    }
  }

  async autoSetToRev({ gitRev }: { gitRev?: string } = {}) {
    const currentGitRev = gitRev || "@";
    const gitHeadContent = await this.getToGitContent(currentGitRev);
    const currentContent = this.toCurrentContent;

    const changes = ChangeServer.singleton().getFixedChanges(
      gitHeadContent,
      currentContent
    );

    const dirty = checkDirty({
      changes: changes,
      range: this.toRange,
    });

    if (dirty) {
      this.setToContent(currentContent);
    } else {
      await this.setToGitInfo({ rev: currentGitRev });
    }
  }

  async getViewerRelationAndContents(): Promise<
    [IViewerRelation, IViewerContents]
  > {
    const originalFromViewerContent = await this.getFromOriginalContent();
    const originalToViewerContent = await this.getToOriginalContent();
    const originalFromViewerContentRev = sha1(originalFromViewerContent);
    const originalToViewerContentRev = sha1(originalToViewerContent);

    return [
      {
        id: this.id,
        fromRange: this.fromRange,
        toRange: this.toRange,
        fromGitRev: this.fromGitRev,
        toGitRev: this.toGitRev,
        fromGitWorkingDirectory: this.fromGitWorkingDirectory,
        toGitWorkingDirectory: this.toGitWorkingDirectory,
        fromContentRev: this.fromContentRev,
        toContentRev: this.toContentRev,
        originalFromViewerContentRev,
        originalToViewerContentRev,
      },
      {
        [originalFromViewerContentRev]: originalFromViewerContent,
        [originalToViewerContentRev]: originalToViewerContent,
      },
    ];
  }
}

export default Relation;
