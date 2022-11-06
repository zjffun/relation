import { IRawRelation } from "../types";

export const getKey = (checkResult: IRawRelation) =>
  `${checkResult.fromPath}:${checkResult.toPath}`;
