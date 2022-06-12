import { Change } from "diff";

export const getNotChangedLines = (changes: Change[]) => {
  const notChangedLines = [];
  let start = 1;
  let end = 1;

  for (const diffLine of changes) {
    if (diffLine.removed) {
      if (start !== end) {
        notChangedLines.push([start, end - 1]);
      }
      end += diffLine.count;
      start = end;
    } else if (diffLine.added) {
      if (start === end) {
        continue;
      }
      notChangedLines.push([start, end - 1]);
      start = end;
    } else {
      end += diffLine.count;
    }
  }

  if (start !== end) {
    notChangedLines.push([start, end - 1]);
  }

  return notChangedLines;
};
