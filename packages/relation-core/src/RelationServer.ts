import fse from "fs-extra";
import * as path from "node:path";
import Relation from "./core/Relation.js";
import { relationId } from "./core/relationId.js";
import createMarkdownRelations from "./mdx/createRelations.js";
import {
  IRawRelation,
  IRelationViewerData,
  IViewerContents,
  IViewerRelation,
} from "./types.js";

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
    const relationBuffer = fse.readFileSync(this.relationFilePath);
    const rawRelations: IRawRelation[] = JSON.parse(relationBuffer.toString());

    const relation = rawRelations.map((d) => {
      return new Relation({
        workingDirectory: this.workingDirectory,
        ...d,
      });
    });

    return relation;
  }

  write(relations: Relation[]) {
    return fse.writeFileSync(
      this.relationFilePath,
      JSON.stringify(relations, null, 2)
    );
  }

  async createMarkdownRelations(info: {
    fromAbsolutePath: string;
    toAbsolutePath: string;
  }) {
    const newRelations = await createMarkdownRelations({
      workingDirectory: this.workingDirectory,
      ...info,
    });

    return newRelations;
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

    await relation.autoSetFromRev();
    await relation.autoSetToRev();

    return relation;
  }

  filter(filter: (relation: Relation) => boolean) {
    const rawRelations = this.read();

    const relations: Relation[] = rawRelations.filter(filter);

    return relations;
  }

  updateById(id, info: Partial<IRawRelation>) {
    const relations = this.read();

    relations.forEach((relation) => {
      if (relation.id === id) {
        Object.assign(relation, info);
      }
    });

    this.write(relations);
  }

  async getRelationViewerData({ fromPath, toPath }) {
    const relations = this.filter(
      (relation) =>
        relation.fromAbsolutePath === relation.getAbsolutePath(fromPath) &&
        relation.toAbsolutePath === relation.getAbsolutePath(toPath)
    );

    if (!relations.length) {
      return;
    }

    const fromModifiedContent = relations[0].fromCurrentContent;
    const toModifiedContent = relations[0].toCurrentContent;

    const viewerRelations: IViewerRelation[] = [];
    const viewerContents: IViewerContents = {};

    for (const relation of relations) {
      const [
        viewerRelation,
        viewerContent,
      ] = await relation.getViewerRelationAndContents();

      viewerRelations.push(viewerRelation);
      Object.assign(viewerContents, viewerContent);
    }

    const relationViewerData: IRelationViewerData = {
      fromPath,
      toPath,
      fromModifiedContent,
      toModifiedContent,
      viewerRelations: viewerRelations,
      viewerContents: viewerContents,
    };

    return relationViewerData;
  }
}
