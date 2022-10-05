import { IRawRelation, PartTypeEnum } from "../types.js";

export const getFileContentKey = (
  relation: Partial<IRawRelation>,
  partType: PartTypeEnum
) => {
  if (partType === PartTypeEnum.TO) {
    const rev = relation.toRev ?? "";
    return `${rev}:${relation.toBaseDir}:${relation.toPath}`;
  }

  const rev = relation.fromRev ?? "";
  return `${rev}:${relation.fromBaseDir}:${relation.fromPath}`;
};
