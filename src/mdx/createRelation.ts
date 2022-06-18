import { getFileContent } from "../git/gitFileContent.js";
import { revParse } from "../git/revParse.js";
import { getRelationRanges } from "./getRelationRanges.js";

export async function createRelations({
  srcPath,
  path,
  srcRev: srcRevParam,
  rev: revParam,
}) {
  const srcRev = revParse(srcRevParam, true);
  const rev = revParse(revParam);
  const srcContent = getFileContent(srcRev, srcPath, true);
  const content = getFileContent(rev, path);
  const relationRanges = await getRelationRanges(srcContent, content);

  const relations = relationRanges.map((d) => {
    return {
      rev,
      path,
      range: d.range,
      srcRev,
      srcPath,
      srcRange: d.srcRange,
    };
  });

  return relations;
}
