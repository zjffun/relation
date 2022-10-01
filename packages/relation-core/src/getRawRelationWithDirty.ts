import ChangeServer from "./core/ChangeServer.js";
import { checkDirty } from "./core/checkDirty.js";
import { getInfo } from "./core/getInfo.js";
import GitServer from "./core/GitServer.js";
import readRelation from "./core/readRelation.js";
import { IOptions, IRawRelation } from "./types";

interface IRawRelationWithDirty extends IRawRelation {
  dirty: boolean;
}

export default async (options?: IOptions): Promise<IRawRelationWithDirty[]> => {
  const { workingDirectory, config } = getInfo(options);

  const rawRelations = readRelation(options);

  let filteredRawRelations = rawRelations;

  if (options.fromPath) {
    filteredRawRelations = rawRelations.filter(
      ({ fromPath }) => fromPath === options.fromPath
    );
  }

  const relations: IRawRelationWithDirty[] = [];
  for (const rawRelation of filteredRawRelations) {
    const fromParsedRev = await GitServer.singleton().parseRev(
      workingDirectory,
      rawRelation.fromRev,
      rawRelation.fromBaseDir
    );

    const fromParsedRevHead = await GitServer.singleton().parseRev(
      workingDirectory,
      config.baseRev,
      rawRelation.fromBaseDir
    );

    const fromChanges = await ChangeServer.singleton().getFixedChanges(
      workingDirectory,
      fromParsedRev,
      fromParsedRevHead,
      rawRelation.fromBaseDir,
      rawRelation.fromPath
    );

    relations.push({
      ...rawRelation,
      dirty: checkDirty({ changes: fromChanges, range: rawRelation.fromRange }),
    });
  }

  return relations;
};
