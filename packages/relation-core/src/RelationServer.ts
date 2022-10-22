import fse from "fs-extra";
import * as path from "node:path";
import simpleGit from "simple-git";
import getDirnameBasename from "./core/getDirnameBasename.js";
import { getFileContents } from "./core/getFileContents.js";
import { getKey } from "./core/getKey.js";
import mergeRelation from "./core/mergeRelation.js";
import { relationId } from "./core/relationId.js";
import readRelation from "./core/readRelation.js";
import writeRelation from "./core/writeRelation.js";
import { createRelations } from "./mdx/createRelations.js";
import { IFileContents, IRawRelation } from "./types.js";
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

  async create(info: {
    fromRev: string;
    fromPath: string;
    fromRange: [number, number];
    toRev: string;
    toPath: string;
    toRange: [number, number];
  }) {
    const [fromDir] = getDirnameBasename(info.fromPath);
    const [toDir] = getDirnameBasename(info.toPath);

    const fromSimpleGit = simpleGit(fromDir);
    const toSimpleGit = simpleGit(toDir);

    const parsedFromRev = (
      await fromSimpleGit.raw("rev-parse", info.fromRev)
    ).trim();
    const parsedToRev = (await toSimpleGit.raw("rev-parse", info.toRev)).trim();

    const fromRootDir = await fromSimpleGit.revparse(["--show-toplevel"]);
    const toRootDir = await toSimpleGit.revparse(["--show-toplevel"]);

    const fromBaseDir = path.relative(this.workingDirectory, fromRootDir);
    const toBaseDir = path.relative(this.workingDirectory, toRootDir);

    const fromPath = path.relative(fromRootDir, info.fromPath);
    const toPath = path.relative(toRootDir, info.toPath);

    const relation: IRawRelation = {
      id: relationId(),
      fromRev: parsedFromRev,
      fromPath,
      fromBaseDir,
      fromRange: info.fromRange,
      toRev: parsedToRev,
      toPath,
      toBaseDir,
      toRange: info.toRange,
    };

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

  async getFileContentsByKey(relationsKey: string): Promise<IFileContents> {
    const relations = this.filter(
      (relation) => getKey(relation) === relationsKey
    );
    const fileContents = await this.getFileContentsByRelations(relations);

    return fileContents;
  }

  async getFileContentsByRelations(relations: IRawRelation[]) {
    const fileContents = await getFileContents(
      this.workingDirectory,
      undefined,
      relations
    );

    return fileContents;
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
}
