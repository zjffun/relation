import { diffLines } from "diff";
import { readFileSync } from "node:fs";
import path, { join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkDirty } from "./core/checkDirty.js";
import { fixChanges } from "./core/fixChanges.js";
import { getLinesRelation } from "./core/getLinesRelation.js";
import { getRelationRange } from "./core/getRelationRange.js";
import { getFileContent } from "./git/gitFileContent.js";
import { ICheckResult, IRawRelation } from "./index.d";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const checkRelations = (): ICheckResult[] => {
  let cwd = process.cwd();

  if (process.env.NODE_ENV === "test") {
    cwd = join(__dirname, "../tests/relation-test-repo");
  }

  const relationFilePath = join(cwd, ".relation", "relation.json");
  const relationBuffer = readFileSync(relationFilePath);
  const rawRelations: IRawRelation[] = JSON.parse(relationBuffer.toString());

  const relations: ICheckResult[] = [];

  rawRelations.forEach((rawRelation) => {
    const content = getFileContent(rawRelation.rev, rawRelation.path);
    const contentHEAD = getFileContent("@", rawRelation.path);

    const srcContent = getFileContent(
      rawRelation.srcRev,
      rawRelation.srcPath,
      true
    );
    const srcContentHEAD = getFileContent("@", rawRelation.srcPath, true);

    const changes = fixChanges(diffLines(content, contentHEAD));
    const linesRelation = getLinesRelation(changes);
    const relationRange = getRelationRange(
      linesRelation.oldLinesRelationMap,
      rawRelation.srcRange
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
  });

  return relations;
};
