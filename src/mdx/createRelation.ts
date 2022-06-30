import { simpleGit } from "simple-git";
import { IOptions } from "../checkRelations.js";
import { getInfo } from "../core/getInfo.js";
import { nanoid } from "../core/nanoid.js";
import { getRelationRanges } from "./getRelationRanges.js";

export async function createRelations(options: IOptions) {
  const { cwd, srcCwd, config } = getInfo(options);

  const destSimpleGit = simpleGit(cwd);
  const srcSimpleGit = simpleGit(srcCwd);

  const content = await destSimpleGit.show([`${options.rev}:${options.path}`]);
  const srcContent = await srcSimpleGit.show([
    `${options.srcRev}:${options.srcPath}`,
  ]);

  const rev = await destSimpleGit.raw("rev-parse", options.rev);
  const srcRev = await srcSimpleGit.raw("rev-parse", options.srcRev);

  const relationRanges = await getRelationRanges(srcContent, content);

  const relations = relationRanges.map((d) => {
    return {
      id: nanoid(),
      rev,
      path: options.path,
      range: d.range,
      srcRev,
      srcPath: options.srcPath,
      srcRange: d.srcRange,
    };
  });

  return relations;
}
