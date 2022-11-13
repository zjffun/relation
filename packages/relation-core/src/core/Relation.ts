import fse from "fs-extra";
import * as path from "node:path";
import simpleGit from "simple-git";
import { IRawRelation } from "../types.js";
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
  public fromRange = undefined;
  public toRange = undefined;
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
    const currentFromAbsolutePath = this.getAbsolutePath(this.fromPath);
    return currentFromAbsolutePath;
  }

  set fromAbsolutePath(absolutePath: string) {
    this.fromPath = this.getRelativePath(absolutePath);
    this.fromGitWorkingDirectory = undefined;
  }

  get toAbsolutePath() {
    const currentToAbsolutePath = this.getAbsolutePath(this.toPath);
    return currentToAbsolutePath;
  }

  set toAbsolutePath(absolutePath: string) {
    this.toPath = this.getRelativePath(absolutePath);
    this.toGitWorkingDirectory = undefined;
  }

  get fromAbsoluteGitWorkingDirectory() {
    const absolutePath = this.getAbsolutePath(this.fromGitWorkingDirectory);
    return absolutePath;
  }

  get toAbsoluteGitWorkingDirectory() {
    const absolutePath = this.getAbsolutePath(this.toGitWorkingDirectory);
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
    });

    return content;
  }

  async getFromOriginalContent() {
    if (this.fromRevType === RelationRevType.git) {
      const content = await this.getGitContent({
        rev: this.fromGitRev,
        absoluteGitWorkingDirectory: this.fromAbsoluteGitWorkingDirectory,
        relativeGitPath: this.fromRelativeGitPath,
      });

      return content;
    }

    if (this.fromRevType === RelationRevType.content) {
      const content = this.getContent(this.fromContentRev);
      return content;
    }
  }

  async getToOriginalContent() {
    if (this.toRevType === RelationRevType.git) {
      const content = await this.getGitContent({
        rev: this.toGitRev,
        absoluteGitWorkingDirectory: this.toAbsoluteGitWorkingDirectory,
        relativeGitPath: this.toRelativeGitPath,
      });

      return content;
    }

    if (this.toRevType === RelationRevType.content) {
      const content = this.getContent(this.toContentRev);
      return content;
    }
  }

  getContent(contentRev: string) {
    const content = fse
      .readFileSync(path.join(this.workingDirectory, "contents", contentRev))
      .toString();

    return content;
  }

  async getGitContent({ absoluteGitWorkingDirectory, rev, relativeGitPath }) {
    const simpleGitInstance = simpleGit(absoluteGitWorkingDirectory);

    const content = await simpleGitInstance.show([`${rev}:${relativeGitPath}`]);
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
  }

  setToContent(content: string) {
    const rev = this.addContent(content);

    this.toContentRev = rev;
  }

  async setFromGitInfo({ rev }) {
    const absoluteGitWorkingDirectory = await this.getAbsoluteGitWorkingDirectory(
      this.fromAbsolutePath
    );

    this.fromGitWorkingDirectory = this.getRelativePath(
      absoluteGitWorkingDirectory
    );

    this.fromGitRev = await this.parseRev(rev, absoluteGitWorkingDirectory);

    this.fromContentRev = undefined;
  }

  async setToGitInfo({ rev }) {
    const absoluteGitWorkingDirectory = await this.getAbsoluteGitWorkingDirectory(
      this.toAbsolutePath
    );

    this.toGitWorkingDirectory = this.getRelativePath(
      absoluteGitWorkingDirectory
    );

    this.toGitRev = await this.parseRev(rev, absoluteGitWorkingDirectory);

    this.toContentRev = undefined;
  }

  async getAbsoluteGitWorkingDirectory(filePath: string) {
    const [dirname] = getDirnameBasename(filePath);
    const git = simpleGit(dirname);
    const rootDir = await git.revparse(["--show-toplevel"]);

    return rootDir;
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

    const filePath = path.join(this.workingDirectory, "contents", rev);

    if (!fse.existsSync(filePath)) {
      fse.ensureFileSync(filePath);
      fse.writeFileSync(filePath, content);
    }

    return rev;
  }
}

export default Relation;
