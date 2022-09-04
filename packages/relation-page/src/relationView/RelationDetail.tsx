import React from "react";
import { RelationTypeEnum } from "../../types";
import RelationComponent from "./RelationsMain";

import {
  ICheckResult,
  IOriginalAndModifiedContentResult,
} from "relation2-core";
import "./RelationDetail.scss";

export default ({
  checkResult,
  currentId,
  originalAndModifiedContents,
}: {
  originalAndModifiedContents: IOriginalAndModifiedContentResult;
  checkResult: ICheckResult;
  currentId?: string;
}) => {
  let type = RelationTypeEnum.relate;
  if (checkResult.dirty) {
    type = RelationTypeEnum.dirty;
  }

  return (
    <main className="relation-detail">
      <header className="relation-detail__header">
        {checkResult.fromPath}:L{checkResult.fromRange[0]},
        {checkResult.fromRange[1]} -&gt; {checkResult.toPath}:L
        {checkResult.toRange[0]},{checkResult.toRange[1]}
      </header>
      <section className="relation-detail__relations">
        {/* <RelationComponent
          relation={{
            texts: [
              originalAndModifiedContents.fromOriginalContent,
              originalAndModifiedContents.fromModifiedContent,
              originalAndModifiedContents.toOriginalContent,
              originalAndModifiedContents.toModifiedContent,
            ],
            relationsArray: [
              [
                [
                  checkResult.fromRange,
                  checkResult.fromModifiedRange,
                  {
                    type,
                    id: checkResult.id,
                  },
                ],
                // ...createViewRelation(checkResult.fromLinesRelation),
              ],
              [
                [
                  checkResult.fromModifiedRange,
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
                  checkResult.toModifiedRange,
                  {
                    type,
                    id: checkResult.id,
                  },
                ],
                // ...createViewRelation(checkResult.toLinesRelation),
              ],
            ],
            currentId,
          }}
        ></RelationComponent> */}
      </section>
    </main>
  );
};
