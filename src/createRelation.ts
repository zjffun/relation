import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getInfo } from "./core/getInfo.js";
import { createRelations } from "./mdx/createRelation.js";
import { IRawRelation } from "./types";

export const createRelation = async (options) => {
  const { relationFilePath } = getInfo(options);

  const relationBuffer = readFileSync(relationFilePath);
  const rawRelations: IRawRelation[] = JSON.parse(relationBuffer.toString());

  const newRelations = await createRelations(options);

  const relations: IRawRelation[] = [...rawRelations, ...newRelations];

  writeFileSync(relationFilePath, JSON.stringify(relations, null, 2));
};
