import { join } from "node:path";
import { readFileSync } from "node:fs";
import { getFileContent } from "./git/gitFileContent";
import { IRawRelation } from "./index.d";
import { diffLines } from "diff";
import { getLinesRelation } from "./core/getLinesRelation";
import { getRelationRange } from "./core/getRelationRange";
import { checkDirty } from "./core/checkDirty";

export const checkRelations = () => {
  let cwd = process.cwd();

  if (process.env.NODE_ENV === "test") {
    cwd = join(__dirname, "../tests/relation-test-repo");
  }

  const relationFilePath = join(cwd, ".relation", "relation.json");
  const relationBuffer = readFileSync(relationFilePath);
  const rawRelations: IRawRelation[] = JSON.parse(relationBuffer.toString());

  const relations = [];

  rawRelations.forEach((rawRelation) => {
    const content = getFileContent(rawRelation.rev, rawRelation.path);
    const contentHEAD = getFileContent("@", rawRelation.path);

    const srcContent = getFileContent(rawRelation.srcRev, rawRelation.srcPath);
    const srcContentHEAD = getFileContent("@", rawRelation.srcPath);

    const changes = diffLines(content, contentHEAD);
    const linesRelation = getLinesRelation(changes);
    const relationRange = getRelationRange(
      linesRelation.oldLinesRelationMap,
      rawRelation.srcRange
    );

    const srcChanges = diffLines(srcContent, srcContentHEAD);
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
