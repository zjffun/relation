import { IFileContents, IRawRelation, PartTypeEnum } from "../types.js";
import { getContent } from "./getContent.js";
import { getFileContentKey } from "./getFileContentKey.js";

export const getFileContents = async (
  workingDirectory: string,
  baseRev: string,
  relations: IRawRelation[]
): Promise<IFileContents> => {
  const fileContents: IFileContents = {};
  const relation = relations[0];
  if (!relation) {
    return fileContents;
  }

  const baseRevRelationAndRelations = [
    {
      ...relation,
      fromRev: baseRev,
      toRev: baseRev,
    },
    ...relations,
  ];

  for (const relation of baseRevRelationAndRelations) {
    fileContents[
      getFileContentKey(relation, PartTypeEnum.FROM)
    ] = await getContent({
      workingDirectory,
      rev: relation.fromRev,
      fileBaseDir: relation.fromBaseDir,
      filePath: relation.fromPath,
    });

    fileContents[
      getFileContentKey(relation, PartTypeEnum.TO)
    ] = await getContent({
      workingDirectory,
      rev: relation.toRev,
      fileBaseDir: relation.toBaseDir,
      filePath: relation.toPath,
    });
  }

  return fileContents;
};
