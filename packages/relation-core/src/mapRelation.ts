import readRelation from "./core/readRelation.js";
import writeRelation from "./core/writeRelation.js";
import { IOptions, IRawRelation } from "./types.js";

export default async (
  map: (relation: IRawRelation) => IRawRelation,
  options?: IOptions
) => {
  const rawRelations = readRelation(options);

  const relations: IRawRelation[] = rawRelations.map(map);

  writeRelation(relations, options);
};
