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
     *   start between currentStart(equal) and currentEnd
     * currentEnd
     */
    if (
      currentOriginalRange[0] <= originalRange[0] &&
      currentOriginalRange[1] > originalRange[0]
    ) {
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
     *   end between currentStart and currentEnd(equal)
     * currentEnd
     */
    if (
      currentOriginalRange[0] < originalRange[1] &&
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
