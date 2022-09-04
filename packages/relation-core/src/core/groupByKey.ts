import groupBy from "lodash/groupBy.js";
import { IRawRelation } from "../types";
import { getKey } from "./getKey.js";

export const groupByKey = (checkResults: IRawRelation[]) => {
  return groupBy(checkResults, (checkResult) => {
    return getKey(checkResult);
  });
};
