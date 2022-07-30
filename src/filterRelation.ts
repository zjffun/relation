import { readFileSync, writeFileSync } from "node:fs";
import { getInfo } from "./core/getInfo.js";
import { IOptions, IRawRelation } from "./types.js";

export const filterRelation = async (
  filter: (relation: IRawRelation) => boolean,
  options?: IOptions
) => {
  const { relationFilePath } = getInfo(options);

  const relationBuffer = readFileSync(relationFilePath);
  const rawRelations: IRawRelation[] = JSON.parse(relationBuffer.toString());

  const relations: IRawRelation[] = rawRelations.filter(filter);

  writeFileSync(relationFilePath, JSON.stringify(relations, null, 2));
};
