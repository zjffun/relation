import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import "./style.scss";

const Page = () => {
  const [viewData, setViewData] = useState<any>([]);

  useEffect(() => {
    if ((window as any).relationLoadData) {
      fetch("./check-results-data.json")
        .then((d) => d.json())
        .then((d) => {
          setViewData(d);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, []);

  if (!viewData) {
    return null;
  }

  return (
    <ul className="file-check-result-list">
      {viewData.map(({ id, key, checkResults, dirty }) => {
        return (
          <li key={key}>
            <details>
              <summary>
                {dirty && "! "}
                {key}
                <button
                  onClick={() => {
                    window.open(
                      `relation-preview-view.html?checkResultViewId=${id}`
                    );
                  }}
                >
                  view
                </button>
              </summary>
              {/* <ul>
                {checkResults.map((checkReault) => {
                  return (
                    <li
                      onClick={() => {
                        window.open(`relation-view.html?id=${checkReault.id}`);
                      }}
                    >
                      L{checkReault.fromRange[0]},{checkReault.fromRange[1]}
                    </li>
                  );
                })}
              </ul> */}
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
      <Page />
    </>
  );
}
