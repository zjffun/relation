import React, { useEffect, useRef, useState } from "react";
import { ICheckResultView, RelationEnum } from "../../types";
import { createView } from "../createView";
import RelationComponent from "./RelationComponent";

import "./RelationOverview.scss";

const CreateMode = () => {
  const [checked, setChecked] = useState(false);
  const [fromStartLine, setFromStartLine] = useState();
  const [fromEndLine, setFromEndLine] = useState();
  const [toStartLine, setToStartLine] = useState();
  const [toEndLine, setToEndLine] = useState();

  const submit = () => {
    document.dispatchEvent(
      new CustomEvent("submitCreateRelation", {
        detail: {
          fromStartLine,
          fromEndLine,
          toStartLine,
          toEndLine,
        },
      })
    );
  };

  useEffect(() => {
    const listener = (event: any) => {
      if (!checked) {
        return;
      }
      setFromStartLine(event.detail.fromStartLine);
      setFromEndLine(event.detail.fromEndLine);
      setToStartLine(event.detail.toStartLine);
      setToEndLine(event.detail.toEndLine);
    };

    document.addEventListener("relationCreateRangeChange", listener);

    return () => {
      document.addEventListener("relationCreateRangeChange", listener);
    };
  }, [checked]);

  return (
    <span>
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        Create Mode
      </label>
      {checked && fromStartLine && fromEndLine && toStartLine && toEndLine && (
        <span>
          L{fromStartLine},{fromEndLine}-L{toStartLine},{toEndLine}
          <button onClick={submit}>submit</button>
        </span>
      )}
    </span>
  );
};

export default ({ checkResults }: { checkResults: ICheckResultView[] }) => {
  const srcContentHEAD = checkResults[0]?.fromContentHEAD;
  const contentHEAD = checkResults[0]?.toContentHEAD;

  const relation: any = [];

  checkResults.forEach((record) => {
    let type = RelationEnum.relate;
    if (record.dirty) {
      type = RelationEnum.dirty;
    }

    relation.push([
      record.fromRelationRange,
      record.toRelationRange,
      { id: record.id, type },
    ]);
  });

  return (
    <main className="relation-overview">
      <header className="relation-overview__header">
        <ul className="relation-overview__header__list">
          <li className="relation-overview__header__list__item">
            <CreateMode></CreateMode>
          </li>
        </ul>
      </header>
      <section className="relation-overview__relations">
        <RelationComponent
          relation={{
            texts: [srcContentHEAD, contentHEAD],
            relationsArray: [relation],
          }}
        ></RelationComponent>
      </section>
    </main>
  );
};
