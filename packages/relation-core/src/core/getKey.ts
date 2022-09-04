import { IRawRelation } from "../types";

export const getKey = (checkResult: IRawRelation) =>
  `${checkResult.fromBaseDir}:${checkResult.fromPath}:${checkResult.toBaseDir}:${checkResult.toPath}`;
