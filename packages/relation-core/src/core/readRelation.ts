import { readFileSync } from "node:fs";
import { IRawRelation } from "../types.js";

export default (relationFilePath: string) => {
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
