import groupBy from "lodash/groupBy";
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { ICheckResultView } from "../types";
import RelationOverview from "./relationView/RelationOverview";
import RelationDetail from "./relationView/RelationDetail";

import "./style.scss";

const checkResults = (window as any).checkResults as ICheckResultView[];

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
  const [detailMode, setDetailMode] = useState(searchParams.detailMode);

  const fileCheckResults = groupBy(checkResults, (d) => {
    return `${d.fromPath} -> ${d.toPath}`;
  });
  const fileCheckResultsEntries = Object.entries(fileCheckResults);

  if (detailMode) {
    const checkResult = checkResults.find((d) => d.id === showingRelation);

    if (checkResult) {
      return (
        <RelationDetail
          checkResult={checkResult}
          currentId={showingRelation}
        ></RelationDetail>
      );
    }

    return <>Not Find {showingRelation}</>;
  }

  const showingCheckResults = fileCheckResultsEntries.find(
    ([, checkResults]) => {
      return checkResults[0].fromPath === showingFile;
    }
  )?.[1];

  if (showingCheckResults) {
    return (
      <RelationOverview
        checkResults={showingCheckResults}
        currentId={showingRelation}
      ></RelationOverview>
    );
  }

  return <>Not Find {showingFile}</>;
};

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <div className="relation-view-page">
      <Page checkResults={checkResults} />
    </div>
  );
}
