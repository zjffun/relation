import React, { FC, useState } from "react";
import { createRoot } from "react-dom/client";
import { ICheckResultView } from "../index";
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

let searchParams = (window as any).relationSearchParams;

if (!searchParams) {
  const sp = new URL(document.location.href).searchParams;
  searchParams = {};
  sp.forEach((value, key) => {
    searchParams[key] = value;
  });
}
const Page = ({ checkResults }: { checkResults: ICheckResultView[] }) => {
  const [showingFile, setShowingFile] = useState(searchParams.srcPath);
  const [showingRelation, setShowingRelation] = useState(searchParams.id);

  const fileCheckResults = groupBy(checkResults, (d) => {
    return `${d.srcPath} -> ${d.path}`;
  });
  const fileCheckResultsEntries = Object.entries(fileCheckResults);

  return (
    <>
      <ul className="file-check-result-list">
        {fileCheckResultsEntries.map(([file, relations]) => {
          return (
            <li>
              <details>
                <summary>
                  {file}
                  <button
                    onClick={() => {
                      setShowingFile(file);
                      setShowingRelation("");
                    }}
                  >
                    view
                  </button>
                </summary>
                <ul>
                  {relations.map((relation) => {
                    return (
                      <li
                        onClick={() => {
                          setShowingFile("");
                          setShowingRelation(relation.id);
                        }}
                      >
                        L{relation.srcRange[0]},{relation.srcRange[1]}
                      </li>
                    );
                  })}
                </ul>
              </details>
            </li>
          );
        })}
      </ul>
      <hr />
      {fileCheckResultsEntries.map(([file, checkResults]) => {
        return (
          <>
            {showingFile === checkResults[0].srcPath ? (
              <>
                <div>{file}</div>
                <RelationOverview
                  checkResults={checkResults}
                ></RelationOverview>
              </>
            ) : null}
            <Relations
              showingRelation={showingRelation}
              checkResults={checkResults}
            ></Relations>
          </>
        );
      })}
    </>
  );
};

const Relations = ({
  checkResults,
  showingRelation,
}: {
  checkResults: ICheckResultView[];
  showingRelation: string;
}) => {
  if (!showingRelation) {
    return null;
  }
  return (
    <>
      {checkResults.map((checkResult) => {
        if (checkResult.id !== showingRelation) {
          return null;
        }
        let type = RelationEnum.relate;
        if (checkResult.dirty) {
          type = RelationEnum.dirty;
        }
        return (
          <>
            <div>
              {checkResult.srcPath}:L{checkResult.srcRange[0]},
              {checkResult.srcRange[1]} -&gt; {checkResult.path}:L
              {checkResult.range[0]},{checkResult.range[1]}
            </div>
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
