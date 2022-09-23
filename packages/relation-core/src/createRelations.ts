import readRelation from "./core/readRelation.js";
import writeRelation from "./core/writeRelation.js";
import { createRelations } from "./mdx/createRelations.js";
import { IRawRelation } from "./types";

export default async (options) => {
  const rawRelations = readRelation(options);

  const newRelations = await createRelations(options);

  const relations: IRawRelation[] = [...rawRelations, ...newRelations];

  writeRelation(relations, options);
};
