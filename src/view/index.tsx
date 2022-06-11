import React, { FC } from "react";
import { createRoot } from "react-dom/client";
import { ICheckResultView } from "../index.d";
import checkResults from "../../checkresult.json";
import RelationComponent from "./components/RelationComponent";
import RelationOverview from "./components/RelationOverview";
import { createViewRelation } from "./createViewRelation";

import "./style.scss";

export enum RelationEnum {
  add = "add",
  remove = "remove",
  change = "change",
  relate = "relate",
  dirty = "dirty",
}

const Relations = ({ checkResults }: { checkResults: ICheckResultView[] }) => {
  return (
    <>
      {checkResults.map((checkResult) => {
        let type = RelationEnum.relate;
        if (checkResult.dirty) {
          type = RelationEnum.dirty;
        }
        return (
          <>
            <RelationComponent
              relation={{
                texts: [
                  checkResult.srcContent,
                  checkResult.srcContentHEAD,
                  checkResult.content,
                  checkResult.contentHEAD,
                ],
                relations: [
                  createViewRelation(checkResult.srcLinesRelation),
                  [
                    [
                      checkResult.srcRelationRange,
                      checkResult.range,
                      {
                        type,
                      },
                    ],
                  ],
                ],
              }}
            ></RelationComponent>
            <hr />
          </>
        );
      })}
    </>
  );
};

createRoot(document.getElementById("root")).render(
  <>
    {/* @ts-ignore */}
    <RelationOverview checkResults={checkResults}></RelationOverview>
    <hr />
    {/* @ts-ignore */}
    <Relations checkResults={checkResults}></Relations>
  </>
);
