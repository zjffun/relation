import React, { FC, useState } from "react";
import { createRoot } from "react-dom/client";
import { ICheckResultView } from "../types";
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
  const [showingFile, setShowingFile] = useState(searchParams.fromPath);
  const [showingRelation, setShowingRelation] = useState(searchParams.id);

  const fileCheckResults = groupBy(checkResults, (d) => {
    return `${d.fromPath} -> ${d.toPath}`;
  });
  const fileCheckResultsEntries = Object.entries(fileCheckResults);

  return (
    <>
      <ul className="file-check-result-list">
        {fileCheckResultsEntries.map(([file, relations]) => {
          return (
            <li key={file}>
              <details>
                <summary>
                  {file}
                  <button
                    onClick={() => {
                      setShowingFile(relations[0].fromPath);
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
                        L{relation.fromRange[0]},{relation.fromRange[1]}
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
          <div key={file}>
            {showingFile === checkResults[0].fromPath ? (
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
          </div>
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
                      },
                    ],
                  ],
                  [
                    [
                      checkResult.toRange,
                      checkResult.toRelationRange,
                      {
                        type,
                      },
                    ],
                    ...createViewRelation(checkResult.toLinesRelation),
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

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <>
      <Page checkResults={checkResults} />
    </>
  );
}
