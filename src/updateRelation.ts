import { readFileSync, writeFileSync } from "node:fs";
import { getInfo } from "./core/getInfo.js";
import mergeRelation from "./core/mergeRelation.js";
import { IOptions, IRawRelation } from "./types";

export const updateRelation = async (options: IOptions) => {
  const { relationFilePath } = getInfo(options);

  const relationBuffer = readFileSync(relationFilePath);
  const rawRelations: IRawRelation[] = JSON.parse(relationBuffer.toString());

  const relations: IRawRelation[] = rawRelations.map((relation) => {
    if (relation.id === options.id) {
      return mergeRelation(relation, {
        fromRev: options.fromPath,
        fromPath: options.fromPath,
        fromRange: options.fromRange,
        toRev: options.fromPath,
        toPath: options.toPath,
        toRange: options.toRange,
      });
    }
    return relation;
  });

  writeFileSync(relationFilePath, JSON.stringify(relations, null, 2));
};
