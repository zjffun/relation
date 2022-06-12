import { Change } from "diff";
import { getNotChangedLines } from "./getNotChangedLines.js";

export interface ICheckDirtyProp {
  changes: Change[];
  range: [number, number];
}

export const checkDirty = ({ changes, range }: ICheckDirtyProp): boolean => {
  const notChangedLines = getNotChangedLines(changes);

  for (const notChangedLine of notChangedLines) {
    if (range[0] >= notChangedLine[0] && range[1] <= notChangedLine[1]) {
      return false;
    }
  }

  return true;
};
