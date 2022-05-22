import { Change } from "diff";

export const getNotChangedLiens = (diffLinesResult: Change[]) => {
  const result = [];
  let start = 1;
  let end = 1;

  for (const diffLine of diffLinesResult) {
    if (diffLine.removed) {
      if (start !== end) {
        result.push([start, end - 1]);
      }
      end += diffLine.count;
      start = end;
    } else if (diffLine.added) {
      if (start === end) {
        continue;
      }
      result.push([start, end - 1]);
      start = end;
    } else {
      end += diffLine.count;
    }
  }

  if (start !== end) {
    result.push([start, end - 1]);
  }

  return result;
};
