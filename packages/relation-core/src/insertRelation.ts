import * as path from "node:path";
import simpleGit from "simple-git";
import getDirnameBasename from "./core/getDirnameBasename.js";
import { getInfo } from "./core/getInfo.js";
import { nanoid } from "./core/nanoid.js";
import readRelation from "./core/readRelation.js";
import writeRelation from "./core/writeRelation.js";
import { IRawRelation } from "./types";

export default async (options) => {
  const { workingDirectory } = getInfo(options);

  const rawRelations = readRelation(options);

  const [fromDir] = getDirnameBasename(options.fromPath);
  const [toDir] = getDirnameBasename(options.toPath);

  const fromSimpleGit = simpleGit(fromDir);
  const toSimpleGit = simpleGit(toDir);

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

  const relations: IRawRelation[] = [
    ...rawRelations,
    {
      id: nanoid(),
      fromRev: parsedFromRev,
      fromPath,
      fromBaseDir,
      fromRange: options.fromRange,
      toRev: parsedToRev,
      toPath,
      toBaseDir,
      toRange: options.toRange,
    },
  ];

  writeRelation(relations, options);
};
