import { readFileSync } from "node:fs";
import { IOptions, IRawRelation } from "../types.js";
import { getInfo } from "./getInfo.js";

export default (options: IOptions) => {
  const { relationFilePath } = getInfo(options);

  const relationBuffer = readFileSync(relationFilePath);
  const rawRelations: IRawRelation[] = JSON.parse(relationBuffer.toString());

  for (const relation of rawRelations) {
    if (!relation.fromBaseDir) {
      relation.fromBaseDir = "";
    }
    if (!relation.toBaseDir) {
      relation.toBaseDir = "";
    }
  }

  return rawRelations;
};
