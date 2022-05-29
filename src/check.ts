import { join } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { Relation } from "./Relation";
import { getFileContent } from "./gitFileContent";
import { relationCheck, RELATION_TYPE } from ".";
import { diffLines } from "diff";
import { getLiensRelation } from "./getLiensRelation";

export const check = () => {
  let cwd = process.cwd();

  if (process.env.NODE_ENV === "test") {
    cwd = join(__dirname, "../tests/repository");
  }

  const filePath = join(cwd, ".relation", "relation.json");
  const buffer = readFileSync(filePath);
  const json = JSON.parse(buffer.toString());

  const fileMap = new Map();

  json.forEach((d) => {
    let file = fileMap.get(d.path2);
    if (!file) {
      file = [];
    }

    //check chagne
    const content1old = getFileContent(d.commitid1, d.path1);
    const content1new = getFileContent("HEAD", d.path1);

    const content2old = getFileContent(d.commitid2, d.path2);
    const content2new = getFileContent("HEAD", d.path2);

    const result = relationCheck({
      oldFile: content1old,
      newFile: content1new,
      relations: [
        {
          type: RELATION_TYPE.SECTION,
          start: d.line2[0],
          end: d.line2[1],
        },
      ],
    });

    if (result[0].dirty) {
      const diffLinesResult = diffLines(content1old, content1new);
      const linesRelation = getLiensRelation(diffLinesResult);

      const relationLine = getRelationLine(linesRelation, d.line1);

      file.push({
        ...d,
        relationLine,
      });
    }
  });

  return fileMap;
};
function getRelationLine(
  linesRelation: {
    oldLines: any[];
    newLines: any[];
    linesRelationMap: Map<any, any>;
  },
  line1: any
) {
  throw new Error("Function not implemented.");
}
