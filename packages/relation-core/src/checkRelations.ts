import { diffLines } from "diff";
import path from "node:path";
import { simpleGit } from "simple-git";
import { checkDirty } from "./core/checkDirty.js";
import { fixChanges } from "./core/fixChanges.js";
import getDirnameBasename from "./core/getDirnameBasename.js";
import { getInfo } from "./core/getInfo.js";
import { getLinesRelation } from "./core/getLinesRelation.js";
import { getRelationRange } from "./core/getRelationRange.js";
import readRelation from "./core/readRelation.js";
import { ICheckResult, IOptions } from "./types";

export default async (options?: IOptions): Promise<ICheckResult[]> => {
  const { workingDirectory, config } = getInfo(options);

  const rawRelations = readRelation(options);

  let filteredRawRelations = rawRelations;

  if (options.fromPath) {
    filteredRawRelations = rawRelations.filter(
      ({ fromPath }) => fromPath === options.fromPath
    );
  }

  const relations: ICheckResult[] = [];
  for (const rawRelation of filteredRawRelations) {
    const [fromDir, fromFile] = getDirnameBasename(
      path.join(workingDirectory, rawRelation.fromPath)
    );
    const [toDir, toFile] = getDirnameBasename(
      path.join(workingDirectory, rawRelation.toPath)
    );

    const fromSimpleGit = simpleGit(fromDir);
    const toSimpleGit = simpleGit(toDir);

    const fromContent = await fromSimpleGit.show([
      `${rawRelation.fromRev}:./${fromFile}`,
    ]);
    const fromContentHEAD = await fromSimpleGit.show([
      `${config.baseRev}:./${fromFile}`,
    ]);

    const toContent = await toSimpleGit.show([
      `${rawRelation.toRev}:./${toFile}`,
    ]);
    const toContentHEAD = await toSimpleGit.show([
      `${config.baseRev}:./${toFile}`,
    ]);

    const toChanges = fixChanges(diffLines(toContent, toContentHEAD));
    const toLinesRelation = getLinesRelation(toChanges);
    const toRelationRange = getRelationRange(
      toLinesRelation.oldLinesRelationMap,
      rawRelation.toRange
    );

    const fromChanges = fixChanges(diffLines(fromContent, fromContentHEAD));
    const fromLinesRelation = getLinesRelation(fromChanges);
    const fromRelationRange = getRelationRange(
      fromLinesRelation.oldLinesRelationMap,
      rawRelation.fromRange
    );

    relations.push({
      ...rawRelation,
      dirty: checkDirty({ changes: fromChanges, range: rawRelation.fromRange }),
      toContent,
      toContentHEAD,
      toLinesRelation,
      toRelationRange,
      fromContent,
      fromContentHEAD,
      fromLinesRelation,
      fromRelationRange,
    });
  }

  return relations;
};
