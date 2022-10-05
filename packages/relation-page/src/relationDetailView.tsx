import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { ICheckResult } from "relation2-core";
import RelationDetail from "./relationView/RelationDetail";

import "./style.scss";

const checkResults = (window as any).checkResults as ICheckResult[];

let searchParams = (window as any).relationSearchParams;

if (!searchParams) {
  const sp = new URL(document.location.href).searchParams;
  searchParams = {};
  sp.forEach((value, key) => {
    searchParams[key] = value;
  });
}

const Page = ({ checkResults }: { checkResults: ICheckResult[] }) => {
  const [showingRelation, setShowingRelation] = useState(searchParams.id);

  const checkResult = checkResults.find((d) => d.id === showingRelation);

  // if (checkResult) {
  //   return (
  //     <RelationDetail
  //       originalAndModifiedContents={originalAndModifiedContents}
  //       checkResult={checkResult}
  //       currentId={showingRelation}
  //     ></RelationDetail>
  //   );
  // }

  return <>Not Find {showingRelation}</>;
};

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <div className="relation-view-page">
      <Page checkResults={checkResults} />
    </div>
  );
}
