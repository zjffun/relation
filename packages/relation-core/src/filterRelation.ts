import readRelation from "./core/readRelation.js";
import writeRelation from "./core/writeRelation.js";
import { IOptions, IRawRelation } from "./types.js";

export default async (
  filter: (relation: IRawRelation) => boolean,
  options?: IOptions
) => {
  const rawRelations = readRelation(options);

  const relations: IRawRelation[] = rawRelations.filter(filter);

  writeRelation(relations, options);
};
