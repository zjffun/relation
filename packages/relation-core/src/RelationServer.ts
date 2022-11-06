import fse from "fs-extra";
import * as path from "node:path";
import simpleGit from "simple-git";
import getDirnameBasename from "./core/getDirnameBasename.js";
import { getKey } from "./core/getKey.js";
import { getRelationsWithContents } from "./core/getRelationsWithContents.js";
import GitServer from "./core/GitServer.js";
import mergeRelation from "./core/mergeRelation.js";
import readRelation from "./core/readRelation.js";
import { relationId } from "./core/relationId.js";
import { sha1 } from "./core/sha1.js";
import writeRelation from "./core/writeRelation.js";
import { createRelations } from "./mdx/createRelations.js";
import { IRawRelation, IRelationsWithContents } from "./types.js";

export default class {
  cwd: string;
  workingDirectory: string;
  relationFilePath: string;

  constructor(cwd?: string) {
    this.cwd = cwd || process.cwd();

    this.workingDirectory = this.cwd;

    this.relationFilePath = path.join(
      this.workingDirectory,
      ".relation",
      "relation.json"
    );
  }

  checkIsInit() {
    if (!fse.existsSync(this.relationFilePath)) {
      return false;
    }

    try {
      const relations = this.read();
      if (Array.isArray(relations)) {
        return true;
      }
    } catch {
      // do nothing
    }

    return false;
  }

  init() {
    if (!this.checkIsInit()) {
      fse.ensureFileSync(this.relationFilePath);
      fse.writeFileSync(this.relationFilePath, "[]");
      return true;
    }
  }

  read() {
    return readRelation(this.relationFilePath);
  }

  write(relations: IRawRelation[]) {
    return writeRelation(relations, this.relationFilePath);
  }

  async createMarkdownRelations(info: {
    fromRev: string;
    fromPath: string;
    toRev: string;
    toPath: string;
  }) {
    const newRelations = await createRelations({
      workingDirectory: this.workingDirectory,
      ...info,
    });

    return newRelations;
  }

  async getGitWorkingDirectory(filePath: string) {
    const [dirname] = getDirnameBasename(filePath);
    const git = simpleGit(dirname);
    const rootDir = await git.revparse(["--show-toplevel"]);
    const gitWorkingDirectory = path.relative(this.workingDirectory, rootDir);

    return gitWorkingDirectory;
  }

  async parseRev(rev: string, gitWorkingDirectory: string) {
    const parsedRev = await GitServer.parseRev(
      this.workingDirectory,
      rev,
      gitWorkingDirectory
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

  async create(info: {
    fromPath: string;
    fromRange: [number, number];
    toPath: string;
    toRange: [number, number];
    fromGitRev?: string;
    toGitRev?: string;
    fromContent?: string;
    toContent?: string;
  }) {
    const fromPath = path.relative(this.workingDirectory, info.fromPath);
    const toPath = path.relative(this.workingDirectory, info.toPath);

    const relation: IRawRelation = {
      id: relationId(),
      fromRange: info.fromRange,
      toRange: info.toRange,
      fromPath,
      toPath,
    };

    if (info.fromGitRev) {
      const fromGitWorkingDirectory = await this.getGitWorkingDirectory(
        info.fromPath
      );

      if (fromGitWorkingDirectory) {
        relation.fromGitWorkingDirectory = fromGitWorkingDirectory;
      }

      relation.fromGitRev = await this.parseRev(
        info.fromGitRev,
        fromGitWorkingDirectory
      );
    } else {
      const contentRev = this.addContent(info.fromContent ?? "");
      relation.fromContentRev = contentRev;
    }

    if (info.toGitRev) {
      const toGitWorkingDirectory = await this.getGitWorkingDirectory(
        info.toPath
      );

      if (toGitWorkingDirectory) {
        relation.toGitWorkingDirectory = toGitWorkingDirectory;
      }

      relation.toGitRev = await this.parseRev(
        info.toGitRev,
        toGitWorkingDirectory
      );
    } else {
      const contentRev = this.addContent(info.toContent ?? "");
      relation.toContentRev = contentRev;
    }

    return relation;
  }

  map(map: (relation: IRawRelation) => IRawRelation) {
    const rawRelations = this.read();

    const relations: IRawRelation[] = rawRelations.map(map);

    return relations;
  }

  filter(filter: (relation: IRawRelation) => boolean) {
    const rawRelations = this.read();

    const relations: IRawRelation[] = rawRelations.filter(filter);

    return relations;
  }

  filterByRelationsKey(relationsKey: string) {
    const rawRelations = this.read();

    const relations: IRawRelation[] = rawRelations.filter((relation) => {
      return getKey(relation) === relationsKey;
    });

    return relations;
  }

  async getRelationsWithContentsByKey(
    relationsKey: string
  ): Promise<IRelationsWithContents> {
    const relations = this.filter(
      (relation) => getKey(relation) === relationsKey
    );

    const relationsWithContents = await this.getRelationsWithContentsByRelations(
      relations
    );

    return relationsWithContents;
  }

  async getRelationsWithContentsByRelations(relations: IRawRelation[]) {
    const relationsWithContents = await getRelationsWithContents(
      this.workingDirectory,
      relations
    );

    return relationsWithContents;
  }

  updateById(id, info: Partial<IRawRelation>) {
    const relations = this.map((relation) => {
      if (relation.id === id) {
        return mergeRelation(relation, info);
      }
      return relation;
    });

    this.write(relations);
  }

  getFileRelativePath(filePath: string) {
    const relativePath = path.relative(this.workingDirectory, filePath);
    return relativePath;
  }

  getFileAbsolutePath(relationPath: string) {
    const absolutePath = path.join(this.workingDirectory, relationPath);
    return absolutePath;
  }
}
