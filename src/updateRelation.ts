import { readFileSync, writeFileSync } from "node:fs";
import path, { join } from "node:path";
import { fileURLToPath } from "node:url";
import { simpleGit } from "simple-git";
import { getInfo } from "./core/getInfo.js";
import mergeRelation from "./core/mergeRelation.js";
import { IRawRelation } from "./types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const updateRelation = async (options) => {
  const { cwd, srcCwd, config } = getInfo(options);

  const srcSimpleGit = simpleGit(srcCwd);
  const destSimpleGit = simpleGit(cwd);

  const parsedRev = await destSimpleGit.raw("rev-parse", options.rev);
  const parsedSrcRev = await srcSimpleGit.raw("rev-parse", options.srcRev);

  const relationFilePath = join(cwd, ".relation", "relation.json");
  const relationBuffer = readFileSync(relationFilePath);
  const rawRelations: IRawRelation[] = JSON.parse(relationBuffer.toString());

  const relations: IRawRelation[] = rawRelations.map((relation) => {
    if (relation.id === options.id) {
      return mergeRelation(relation, {
        srcRev: parsedSrcRev,
        rev: parsedRev,
        srcPath: options.srcPath,
        path: options.path,
      });
    }
    return relation;
  });

  writeFileSync(relationFilePath, JSON.stringify(relations, null, 2));
};
