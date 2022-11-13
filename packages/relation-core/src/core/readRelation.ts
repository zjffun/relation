import { readFileSync } from "node:fs";
import { IRawRelation } from "../types.js";
import Relation from "./Relation.js";

export default (relationFilePath: string) => {
  const relationBuffer = readFileSync(relationFilePath);
  const rawRelations: IRawRelation[] = JSON.parse(relationBuffer.toString());

  const relation = rawRelations.map((d) => {
    return new Relation(d);
  });

  return relation;
};
