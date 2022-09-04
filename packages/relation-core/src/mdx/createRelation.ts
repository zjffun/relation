import * as path from "node:path";
import { simpleGit } from "simple-git";
import getDirnameBasename from "../core/getDirnameBasename.js";
import { getInfo } from "../core/getInfo.js";
import { nanoid } from "../core/nanoid.js";
import { IOptions } from "../types.js";
import { getRelationRanges } from "./getRelationRanges.js";

export async function createRelations(options: IOptions) {
  const { workingDirectory } = getInfo(options);

  const [fromDir, fromFile] = getDirnameBasename(options.fromPath);
  const [toDir, toFile] = getDirnameBasename(options.toPath);

  const fromSimpleGit = simpleGit(fromDir);
  const toSimpleGit = simpleGit(toDir);

  const fromContent = await fromSimpleGit.show([
    `${options.fromRev}:./${fromFile}`,
  ]);
  const toContent = await toSimpleGit.show([`${options.toRev}:./${toFile}`]);

  const parsedFromRev = (
    await fromSimpleGit.raw("rev-parse", options.fromRev)
  ).trim();
  const parsedToRev = (
    await toSimpleGit.raw("rev-parse", options.toRev)
  ).trim();

  const fromRootDir = await fromSimpleGit.revparse(["--show-toplevel"]);
  const toRootDir = await toSimpleGit.revparse(["--show-toplevel"]);

  const fromBaseDir = path.relative(workingDirectory, fromRootDir);
  const toBaseDir = path.relative(workingDirectory, toRootDir);

  const fromPath = path.relative(fromRootDir, options.fromPath);
  const toPath = path.relative(toRootDir, options.toPath);

  const relationRanges = await getRelationRanges(fromContent, toContent);

  const relations = relationRanges.map(({ fromRange, toRange }) => {
    return {
      id: nanoid(),
      fromRev: parsedFromRev,
      fromPath,
      fromBaseDir,
      fromRange,
      toRev: parsedToRev,
      toPath,
      toBaseDir,
      toRange,
    };
  });

  return relations;
}
