import { readFileSync, writeFileSync } from "node:fs";
import path, { join } from "node:path";
import { fileURLToPath } from "node:url";
import { IRawRelation } from "./index.d";
import { createRelations } from "./mdx/createRelation.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const createRelation = async ({ srcPath, path, srcRev, rev }) => {
  let cwd = process.cwd();

  if (process.env.NODE_ENV === "test") {
    cwd = join(__dirname, "../tests/relation-test-repo");
  }

  const relationFilePath = join(cwd, ".relation", "relation.json");
  const relationBuffer = readFileSync(relationFilePath);
  const rawRelations: IRawRelation[] = JSON.parse(relationBuffer.toString());

  const newRelations = await createRelations({ srcPath, path, srcRev, rev });

  const relations: IRawRelation[] = [...rawRelations, ...newRelations];

  writeFileSync(relationFilePath, JSON.stringify(relations, null, 2));
};
