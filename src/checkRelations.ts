import { diffLines } from "diff";
import { readFileSync } from "node:fs";
import path, { join } from "node:path";
import { fileURLToPath } from "node:url";
import { simpleGit } from "simple-git";
import { checkDirty } from "./core/checkDirty.js";
import { fixChanges } from "./core/fixChanges.js";
import { getInfo } from "./core/getInfo.js";
import { getLinesRelation } from "./core/getLinesRelation.js";
import { getRelationRange } from "./core/getRelationRange.js";
import { ICheckResult, IRawRelation } from "./types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface IOptions {
  cwd?: string;
  [key: string]: string;
}

export const checkRelations = async (
  options?: IOptions
): Promise<ICheckResult[]> => {
  const { cwd, srcCwd, config } = getInfo(options);

  const relationFilePath = join(cwd, ".relation", "relation.json");
  const relationBuffer = readFileSync(relationFilePath);
  const rawRelations: IRawRelation[] = JSON.parse(relationBuffer.toString());

  const srcSimpleGit = simpleGit(srcCwd);
  const destSimpleGit = simpleGit(cwd);

  const relations: ICheckResult[] = [];
  for (const rawRelation of rawRelations) {
    const content = await destSimpleGit.show([
      `${rawRelation.rev}:${rawRelation.path}`,
    ]);
    const contentHEAD = await destSimpleGit.show([
      `${config.baseRev}:${rawRelation.path}`,
    ]);

    const srcContent = await srcSimpleGit.show([
      `${rawRelation.srcRev}:${rawRelation.srcPath}`,
    ]);

    const srcContentHEAD = await srcSimpleGit.show([
      `${config.baseRev}:${rawRelation.srcPath}`,
    ]);

    const changes = fixChanges(diffLines(content, contentHEAD));
    const linesRelation = getLinesRelation(changes);
    const relationRange = getRelationRange(
      linesRelation.oldLinesRelationMap,
      rawRelation.range
    );

    const srcChanges = fixChanges(diffLines(srcContent, srcContentHEAD));
    const srcLinesRelation = getLinesRelation(srcChanges);
    const srcRelationRange = getRelationRange(
      srcLinesRelation.oldLinesRelationMap,
      rawRelation.srcRange
    );

    relations.push({
      ...rawRelation,
      dirty: checkDirty({ changes: srcChanges, range: rawRelation.srcRange }),
      content,
      contentHEAD,
      linesRelation,
      relationRange,
      srcContent,
      srcContentHEAD,
      srcLinesRelation,
      srcRelationRange,
    });
  }

  return relations;
};
