import fse from "fs-extra";
import * as path from "node:path";
import simpleGit from "simple-git";
import ChangeServer from "./core/ChangeServer.js";
import { checkDirty } from "./core/checkDirty.js";
import getDirnameBasename from "./core/getDirnameBasename.js";
import { getKey } from "./core/getKey.js";
import { getRelationsWithContents } from "./core/getRelationsWithContents.js";
import mergeRelation from "./core/mergeRelation.js";
import readRelation from "./core/readRelation.js";
import Relation from "./core/Relation.js";
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
    fromAbsolutePath: string;
    fromRange: [number, number];
    toAbsolutePath: string;
    toRange: [number, number];
  }) {
    const relation = new Relation({
      workingDirectory: this.workingDirectory,
      id: relationId(),
      fromRange: info.fromRange,
      toRange: info.toRange,
    });

    relation.fromAbsolutePath = info.fromAbsolutePath;
    relation.toAbsolutePath = info.toAbsolutePath;

    {
      const gitHeadContent = await relation.getFromGitContent("@");
      const currentContent = relation.fromCurrentContent;

      const changes = ChangeServer.singleton().getFixedChanges(
        gitHeadContent,
        currentContent
      );

      const dirty = checkDirty({
        changes: changes,
        range: relation.fromRange,
      });

      if (dirty) {
        relation.setFromContent(currentContent);
      } else {
        await relation.setFromGitInfo({ rev: "@" });
      }
    }

    {
      const gitHeadContent = await relation.getToGitContent("@");
      const currentContent = relation.toCurrentContent;

      const changes = ChangeServer.singleton().getFixedChanges(
        gitHeadContent,
        currentContent
      );

      const dirty = checkDirty({
        changes: changes,
        range: relation.toRange,
      });

      if (dirty) {
        relation.setToContent(currentContent);
      } else {
        await relation.setToGitInfo({ rev: "@" });
      }
    }

    return relation;
  }

  map(map: (relation: IRawRelation) => IRawRelation) {
    const rawRelations = this.read();

    const relations: IRawRelation[] = rawRelations.map(map);

    return relations;
  }

  filter(filter: (relation: Relation) => boolean) {
    const rawRelations = this.read();

    const relations: Relation[] = rawRelations.filter(filter);

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

  async getRelationsWithContentsByRelations(relations: Relation[]) {
    const relationsWithContents = await getRelationsWithContents(relations);

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
}
