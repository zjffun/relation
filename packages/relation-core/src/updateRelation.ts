import mergeRelation from "./core/mergeRelation.js";
import readRelation from "./core/readRelation.js";
import writeRelation from "./core/writeRelation.js";
import { IOptions, IRawRelation } from "./types.js";

export default async (options: IOptions) => {
  const rawRelations = readRelation(options);

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

  writeRelation(relations, options);
};
