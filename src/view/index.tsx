import React, { FC } from "react";
import { createRoot } from "react-dom/client";
import { ICheckResultView } from "../index.d";
import RelationComponent from "./components/RelationComponent";
import RelationOverview from "./components/RelationOverview";
import { createViewRelation } from "./createViewRelation";
import groupBy from "lodash/groupBy";

import "./style.scss";

export enum RelationEnum {
  add = "add",
  remove = "remove",
  change = "change",
  relate = "relate",
  dirty = "dirty",
}

const checkResults = (window as any).checkResults;

const Page = ({ checkResults }: { checkResults: ICheckResultView[] }) => {
  const fileCheckResults = groupBy(checkResults, (d) => {
    return `${d.srcPath} -> ${d.path}`;
  });
  const fileCheckResultsEntries = Object.entries(fileCheckResults);

  return (
    <>
      <ul>
        {fileCheckResultsEntries.map(([file]) => {
          return <li>{file}</li>;
        })}
      </ul>
      <hr />
      {fileCheckResultsEntries.map(([file, checkResults]) => {
        return (
          <>
            <div>{file}</div>
            <RelationOverview checkResults={checkResults}></RelationOverview>
            <hr />
            <Relations checkResults={checkResults}></Relations>
          </>
        );
      })}
    </>
  );
};

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
                  [
                    [
                      checkResult.srcRange,
                      checkResult.srcRelationRange,
                      {
                        type,
                      },
                    ],
                    ...createViewRelation(checkResult.srcLinesRelation),
                  ],
                  [
                    [
                      checkResult.srcRelationRange,
                      checkResult.range,
                      {
                        type,
                      },
                    ],
                  ],
                  [
                    [
                      checkResult.range,
                      checkResult.relationRange,
                      {
                        type,
                      },
                    ],
                    ...createViewRelation(checkResult.linesRelation),
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
    <Page checkResults={checkResults} />
  </>
);
