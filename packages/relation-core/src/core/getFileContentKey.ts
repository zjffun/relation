import { IRawRelation, PartTypeEnum } from "../types.js";

export const getFileContentKey = (
  relation: Partial<IRawRelation>,
  partType: PartTypeEnum
) => {
  if (partType === PartTypeEnum.TO) {
    const rev = relation.toContentRev ?? relation.toGitRev ?? "";
    return `${rev}:${relation.toPath}`;
  }

  const rev = relation.toContentRev ?? relation.toGitRev ?? "";
  return `${rev}:${relation.fromPath}`;
};
