import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { IViewData } from "relation2-core";
import RelationsWindow from "./relationView/RelationsWindow";

import "./style.scss";

let searchParams = (window as any).relationSearchParams;

if (!searchParams) {
  const sp = new URL(document.location.href).searchParams;
  searchParams = {};
  sp.forEach((value, key) => {
    searchParams[key] = value;
  });
}

const Page = () => {
  const [viewCheckResults, setviewCheckResults] = useState(
    (window as any).__VIEW_CHECK_RESULTS__ as IViewData
  );

  const [showingRelation, setShowingRelation] = useState(searchParams.id);

  useEffect(() => {
    if ((window as any).relationLoadData) {
      fetch(`./previews/${searchParams.checkResultViewId}.json`)
        .then((d) => d.json())
        .then((d) => {
          setviewCheckResults(d);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, []);

  if (!viewCheckResults) {
    return null;
  }

  return (
    <RelationsWindow
      viewCheckResults={viewCheckResults}
      currentId={showingRelation}
      readOnly={true}
    ></RelationsWindow>
  );
};

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <div className="relation-view-page">
      <Page />
    </div>
  );
}
