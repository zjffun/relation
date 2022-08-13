import React, { useEffect, useRef } from "react";
import { ICheckResultView, RelationEnum } from "../../types";
import { createView } from "../createView";

export default ({ checkResults }: { checkResults: ICheckResultView[] }) => {
  const ref = useRef(null);

  const srcContentHEAD = checkResults[0]?.fromContentHEAD;
  const contentHEAD = checkResults[0]?.toContentHEAD;

  useEffect(() => {
    const relation: any = [];

    checkResults.forEach((record) => {
      let type = RelationEnum.relate;
      if (record.dirty) {
        type = RelationEnum.dirty;
      }

      relation.push([
        record.fromRelationRange,
        record.toRelationRange,
        { id: record.id, type },
      ]);
    });
    createView(ref.current, {
      texts: [srcContentHEAD, contentHEAD],
      relationsArray: [relation],
    });
  }, []);

  return <section className="relation-container" ref={ref}></section>;
};
