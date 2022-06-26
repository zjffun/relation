import { Change } from "diff";
import { ILineRange, ILinesRelation } from "../types";

export const getLinesRelation = (changes: Change[]): ILinesRelation => {
  const oldLines: ILineRange[] = [];
  const newLines: ILineRange[] = [];
  const oldLinesRelationMap = new Map();
  const newLinesRelationMap = new Map();

  let oldStart = 1;
  let oldEnd = 1;

  let newStart = 1;
  let newEnd = 1;

  for (const change of changes) {
    if (change.removed) {
      oldEnd += change.count;
      let oldLine: ILineRange = [oldStart, oldEnd - 1];

      oldLines.push(oldLine);
      oldStart = oldEnd;

      const latestNewLine = newLines.at(-1);
      if (!latestNewLine) {
        oldLinesRelationMap.set(oldLine, [1, null]);
      } else {
        oldLinesRelationMap.set(oldLine, [latestNewLine[1] + 1, null]);
      }
    } else if (change.added) {
      newEnd += change.count;
      let newLine: ILineRange = [newStart, newEnd - 1];

      newLines.push(newLine);
      newStart = newEnd;

      const latestOldLine = oldLines.at(-1);
      if (!latestOldLine) {
        newLinesRelationMap.set(newLine, [1, null]);
      } else if (latestOldLine?.[2]?.dirty === false) {
        newLinesRelationMap.set(newLine, [latestOldLine[1] + 1, null]);
      } else {
        newLinesRelationMap.set(newLine, latestOldLine);
        oldLinesRelationMap.set(latestOldLine, newLine);
      }
    } else {
      oldEnd += change.count;
      let oldLine: ILineRange = [oldStart, oldEnd - 1, { dirty: false }];
      oldLines.push(oldLine);
      oldStart = oldEnd;

      newEnd += change.count;
      let newLine: ILineRange = [newStart, newEnd - 1, { dirty: false }];
      newLines.push(newLine);
      newStart = newEnd;

      oldLinesRelationMap.set(oldLine, newLine);
      newLinesRelationMap.set(newLine, oldLine);
    }
  }

  return {
    oldLines,
    newLines,
    oldLinesRelationMap,
    newLinesRelationMap,
  };
};
