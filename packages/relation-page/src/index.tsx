import groupBy from "lodash/groupBy";
import React from "react";
import { createRoot } from "react-dom/client";
import { ICheckResultView } from "../types";

import "./style.scss";

const checkResults = (window as any).checkResults as ICheckResultView[];

const Page = ({ checkResults }: { checkResults: ICheckResultView[] }) => {
  const fileCheckResults = groupBy(checkResults, (d) => {
    return `${d.fromPath} -> ${d.toPath}`;
  });
  const fileCheckResultsEntries = Object.entries(fileCheckResults);

  return (
    <ul className="file-check-result-list">
      {fileCheckResultsEntries.map(([file, relations]) => {
        return (
          <li key={file}>
            <details>
              <summary>
                {file}
                <button
                  onClick={() => {
                    window.open(
                      `relation-view.html?fromPath=${relations[0].fromPath}`
                    );
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
                        window.open(`relation-view.html?id=${relation.id}`);
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
