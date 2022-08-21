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

  const gitServer = new GitServer();

  const relations: IRawRelationWithDirty[] = [];
  for (const rawRelation of filteredRawRelations) {
    const fromParsedRev = await gitServer.parseRev(
      workingDirectory,
      rawRelation.fromRev,
      rawRelation.fromPath
    );

    const fromParsedRevHead = await gitServer.parseRev(
      workingDirectory,
      config.baseRev,
      rawRelation.fromPath
    );

    const fromChanges = await ChangeServer.singleton().getFixedChanges(
      workingDirectory,
      fromParsedRev,
      fromParsedRevHead,
      rawRelation.fromPath
    );

    relations.push({
      ...rawRelation,
      dirty: checkDirty({ changes: fromChanges, range: rawRelation.fromRange }),
    });
  }

  return relations;
};
