import { Change } from "diff";
import { ILineRelation, LineRelationTypeEnum } from "../types.js";

export const getLineRelations = (changes: Change[]): ILineRelation[] => {
  const lineRelations: ILineRelation[] = [];

  let originalStart = 1;
  let originalEnd = 1;

  let modifiedStart = 1;
  let modifiedEnd = 1;

  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];

    if (change.removed) {
      const nextChange = changes[i + 1];

      originalEnd += change.count;
      let originalRange: [number, number] = [originalStart, originalEnd];
      originalStart = originalEnd;

      let modifiedRange: [number, number];

      // modified
      if (nextChange?.added) {
        i++;
        modifiedEnd += nextChange.count;
        modifiedRange = [modifiedStart, modifiedEnd];
        modifiedStart = modifiedEnd;

        lineRelations.push({
          originalRange,
          modifiedRange,
          type: LineRelationTypeEnum.MODIFIED,
        });

        continue;
      }

      modifiedRange = [modifiedStart, modifiedEnd];

      lineRelations.push({
        originalRange,
        modifiedRange,
        type: LineRelationTypeEnum.REMOVED,
      });

      continue;
    }

    if (change.added) {
      modifiedEnd += change.count;
      let modifiedRange: [number, number] = [modifiedStart, modifiedEnd];
      modifiedStart = modifiedEnd;

      let originalRange: [number, number] = [originalStart, originalEnd];

      lineRelations.push({
        originalRange,
        modifiedRange,
        type: LineRelationTypeEnum.ADDED,
      });

      continue;
    }

    originalEnd += change.count;
    const originalRange: [number, number] = [originalStart, originalEnd];
    originalStart = originalEnd;

    modifiedEnd += change.count;
    const modifiedRange: [number, number] = [modifiedStart, modifiedEnd];
    modifiedStart = modifiedEnd;

    lineRelations.push({
      originalRange,
      modifiedRange,
    });
  }

  return lineRelations;
};
