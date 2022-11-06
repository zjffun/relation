import { readFileSync } from "node:fs";
import { IRawRelation } from "../types.js";

export default (relationFilePath: string) => {
  const relationBuffer = readFileSync(relationFilePath);
  const rawRelations: IRawRelation[] = JSON.parse(relationBuffer.toString());
  return rawRelations;
};
