import { Change } from "diff";

export const getLiensRelation = (diffLinesResult: Change[]) => {
  const oldLines = [];
  const newLines = [];
  const linesRelationMap = new Map();

  let oldStart = 1;
  let oldEnd = 1;

  let newStart = 1;
  let newEnd = 1;

  for (const diffLine of diffLinesResult) {
    if (diffLine.removed) {
      oldEnd += diffLine.count;
      let oldLine = [oldStart, oldEnd - 1];

      oldLines.push(oldLine);
      oldStart = oldEnd;

      linesRelationMap.set(oldLine, []);
    } else if (diffLine.added) {
      newEnd += diffLine.count;
      let newLine = [newStart, newEnd - 1];

      newLines.push(newLine);
      newStart = newEnd;

      const latestOldLine = oldLines.at(-1);
      if (linesRelationMap.get(latestOldLine) === null) {
        linesRelationMap.set(newLine, null);
      } else {
        linesRelationMap.set(newLine, latestOldLine);
        linesRelationMap.set(latestOldLine, newLine);
      }
    } else {
      oldEnd += diffLine.count;
      let oldLine = [oldStart, oldEnd - 1];
      oldLines.push(oldLine);
      oldStart = oldEnd;

      newEnd += diffLine.count;
      let newLine = [newStart, newEnd - 1];
      newLines.push(newLine);
      newStart = newEnd;

      linesRelationMap.set(oldLine, null);
      linesRelationMap.set(newLine, null);
    }
  }

  return {
    oldLines,
    newLines,
    linesRelationMap,
  };
};
