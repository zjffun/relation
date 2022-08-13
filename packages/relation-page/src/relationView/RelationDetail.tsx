import React from "react";
import { ICheckResultView, RelationEnum } from "../../types";
import RelationComponent from "./RelationComponent";
import { createViewRelation } from "../createViewRelation";

export default ({ checkResult }: { checkResult: ICheckResultView }) => {
  let type = RelationEnum.relate;
  if (checkResult.dirty) {
    type = RelationEnum.dirty;
  }

  return (
    <>
      <div>
        {checkResult.fromPath}:L{checkResult.fromRange[0]},
        {checkResult.fromRange[1]} -&gt; {checkResult.toPath}:L
        {checkResult.toRange[0]},{checkResult.toRange[1]}
      </div>
      <RelationComponent
        relation={{
          texts: [
            checkResult.fromContent,
            checkResult.fromContentHEAD,
            checkResult.toContent,
            checkResult.toContentHEAD,
          ],
          relationsArray: [
            [
              [
                checkResult.fromRange,
                checkResult.fromRelationRange,
                {
                  type,
                  id: checkResult.id,
                },
              ],
              ...createViewRelation(checkResult.fromLinesRelation),
            ],
            [
              [
                checkResult.fromRelationRange,
                checkResult.toRange,
                {
                  type,
                  id: checkResult.id,
                },
              ],
            ],
            [
              [
                checkResult.toRange,
                checkResult.toRelationRange,
                {
                  type,
                  id: checkResult.id,
                },
              ],
              ...createViewRelation(checkResult.toLinesRelation),
            ],
          ],
        }}
      ></RelationComponent>
    </>
  );
};
