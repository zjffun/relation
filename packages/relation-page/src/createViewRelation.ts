import { RelationTypeEnum } from "../types";

export const createViewRelation = (linesRelation) => {
  const viewRelation = [];
  linesRelation.oldLinesRelationMap.forEach((d) => {
    if (d[0]?.[2]?.dirty !== false) {
      let type = RelationTypeEnum.change;

      if (d[1][1] === null) {
        type = RelationTypeEnum.remove;
      }

      viewRelation.push([...d, { type }]);
    }
  });

  linesRelation.newLinesRelationMap.forEach((d) => {
    if (d[0]?.[2]?.dirty !== false && d[1][1] === null) {
      viewRelation.push([
        d[1],
        d[0],
        {
          type: RelationTypeEnum.add,
        },
      ]);
    }
  });

  return viewRelation;
};
