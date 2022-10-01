import path from "node:path";
import ChangeServer from "./core/ChangeServer.js";
import { checkDirty } from "./core/checkDirty.js";
import { getInfo } from "./core/getInfo.js";
import { getLineRelations } from "./core/getLineRelations.js";
import { getModifiedRange } from "./core/getModifiedRange.js";
import GitServer from "./core/GitServer.js";
import { groupByKey } from "./core/groupByKey.js";
import readRelation from "./core/readRelation.js";
import { ICheckResult, IOptions } from "./types";

export default async (
  options?: IOptions & { relationsKey?: string; from?: string }
): Promise<ICheckResult[]> => {
  const { workingDirectory, config } = getInfo(options);

  const rawRelations = readRelation(options);

  let filteredRawRelations = rawRelations;

  if (options?.relationsKey) {
    filteredRawRelations = groupByKey(rawRelations)[options.relationsKey];
  } else if (options?.from) {
    filteredRawRelations = rawRelations.filter(
      (relation) =>
        options.from ===
        path.join(workingDirectory, relation.fromBaseDir, relation.fromPath)
    );
  }

  const relations: ICheckResult[] = [];
  for (const rawRelation of filteredRawRelations) {
    const currentToRev = await GitServer.singleton().parseRev(
      workingDirectory,
      config.baseRev,
      rawRelation.toBaseDir
    );
    const toChanges = await ChangeServer.singleton().getFixedChanges(
      workingDirectory,
      rawRelation.toRev,
      currentToRev,
      rawRelation.toBaseDir,
      rawRelation.toPath
    );
    const toLineRelations = getLineRelations(toChanges);
    const toModifiedRange = getModifiedRange(
      toLineRelations,
      rawRelation.toRange
    );

    const currentFromRev = await GitServer.singleton().parseRev(
      workingDirectory,
      config.baseRev,
      rawRelation.fromBaseDir
    );
    const fromChanges = await ChangeServer.singleton().getFixedChanges(
      workingDirectory,
      rawRelation.fromRev,
      currentFromRev,
      rawRelation.fromBaseDir,
      rawRelation.fromPath
    );
    const fromLineRelations = getLineRelations(fromChanges);
    const fromModifiedRange = getModifiedRange(
      fromLineRelations,
      rawRelation.fromRange
    );

    relations.push({
      ...rawRelation,
      dirty: checkDirty({ changes: fromChanges, range: rawRelation.fromRange }),
      toModifiedRange,
      fromModifiedRange,
      currentFromRev,
      currentToRev,
    });
  }

  return relations;
};
