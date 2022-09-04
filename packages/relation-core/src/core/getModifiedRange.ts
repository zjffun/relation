import { ILineRelation } from "../types";

export const getModifiedRange = (
  lineRelations: ILineRelation[],
  originalRange: [number, number]
): [number, number] => {
  let start;
  let end;

  for (const lineRelation of lineRelations) {
    const {
      originalRange: currentOriginalRange,
      modifiedRange: currentModifiedRange,
      type,
    } = lineRelation;

    /**
     * currentStart
     * start
     * currentEnd
     */
    if (
      currentOriginalRange[0] <= originalRange[0] &&
      currentOriginalRange[1] >= originalRange[0]
    ) {
      if (start !== undefined) {
        continue;
      }

      if (!type) {
        start =
          currentModifiedRange[0] +
          (originalRange[0] - currentOriginalRange[0]);
      } else {
        start = currentModifiedRange[0];
      }
    }

    /**
     * currentStart
     * end
     * currentEnd
     */
    if (
      currentOriginalRange[0] <= originalRange[1] &&
      currentOriginalRange[1] >= originalRange[1]
    ) {
      if (!type) {
        end =
          currentModifiedRange[1] -
          (currentOriginalRange[1] - originalRange[1]);
        break;
      }

      end = currentModifiedRange[1];
      break;
    }
  }

  return [start, end];
};
