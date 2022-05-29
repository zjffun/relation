import { Change } from "diff";

export const getRelationLine = (linesRelation, line1) => {
  const oldLines = [];
  const newLines = [];

  linesRelation.oldLines.forEach((line) => {
    if (line[0] > line1[1] || line[1] < line1[0]) {
      return;
    }

    oldLines.push(line);
    newLines.push(linesRelation.linesRelationMap.get(line));
  });

  return {
    oldLines,
    newLines,
  };
};
