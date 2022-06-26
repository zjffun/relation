import { readFileSync, writeFileSync } from "node:fs";
import path, { join } from "node:path";
import { fileURLToPath } from "node:url";
import mergeRelation from "./core/mergeRelation.js";
import { revParse } from "./git/revParse.js";
import { IRawRelation } from "./types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const updateRelation = async ({ id, srcPath, path, srcRev, rev }) => {
  let cwd = process.cwd();

  if (process.env.NODE_ENV === "test") {
    cwd = join(__dirname, "../tests/relation-test-repo");
  }

  const relationFilePath = join(cwd, ".relation", "relation.json");
  const relationBuffer = readFileSync(relationFilePath);
  const rawRelations: IRawRelation[] = JSON.parse(relationBuffer.toString());

  const relations: IRawRelation[] = rawRelations.map((relation) => {
    if (relation.id === id) {
      return mergeRelation(relation, {
        srcRev: revParse(srcRev, true),
        rev: revParse(rev),
        srcPath,
        path,
      });
    }
    return relation;
  });

  writeFileSync(relationFilePath, JSON.stringify(relations, null, 2));
};
