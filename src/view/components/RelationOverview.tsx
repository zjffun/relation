import React, { useEffect, useRef } from "react";
import { RelationEnum } from "..";
import { ICheckResultView } from "../../index.d";
import { createView } from "../createView";

export default ({ checkResults }: { checkResults: ICheckResultView[] }) => {
  const ref = useRef(null);

  const srcContentHEAD = checkResults[0]?.srcContentHEAD;
  const contentHEAD = checkResults[0]?.contentHEAD;

  useEffect(() => {
    const relation = [];

    checkResults.forEach((record) => {
      let type = RelationEnum.relate;
      if (record.dirty) {
        type = RelationEnum.dirty;
      }

      relation.push([
        record.srcRelationRange,
        record.relationRange,
        {
          type,
        },
      ]);
    });
    createView(ref.current, {
      texts: [srcContentHEAD, contentHEAD],
      relations: [relation],
    });
  }, []);

  return <section className="relation-container" ref={ref}></section>;
};
