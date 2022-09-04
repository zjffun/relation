import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { ICheckResultView, RelationTypeEnum } from "../../types";
import RelationsMain from "./RelationsMain";

import "./RelationsWindow.scss";

const infoKey = [
  "currentFromRev",
  "fromBaseDir",
  "fromPath",
  "currentToRev",
  "toBaseDir",
  "toPath",
];

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

export default ({
  viewCheckResults,
  currentId,
  readOnly,
}: {
  viewCheckResults: ICheckResultView;
  currentId?: string;
  readOnly?: boolean;
}) => {
  const [openInfo, setOpenInfo] = useState(false);
  const { checkResults } = viewCheckResults;

  const relation: any = [];

  checkResults.forEach((record) => {
    let type = RelationTypeEnum.relate;
    if (record.dirty) {
      type = RelationTypeEnum.dirty;
    }

    relation.push([
      record.fromModifiedRange,
      record.toModifiedRange,
      { id: record.id, type },
    ]);
  });

  return (
    <main
      className={classNames({
        "relation-overview": true,
        "relation-overview--read-only": readOnly,
      })}
    >
      <header className="relation-overview__header">
        <ul className="relation-overview__header__list">
          <li>
            <button onClick={() => setOpenInfo(true)}>info</button>
            <dialog open={openInfo} className="relation-overview__dialog">
              <dl>
                {infoKey.map((key, i) => {
                  return (
                    <>
                      <dt key={i}>{key}</dt>
                      <dd key={i}>{viewCheckResults[key]}</dd>
                    </>
                  );
                })}
              </dl>

              <form method="dialog">
                <button onClick={() => setOpenInfo(false)}>OK</button>
              </form>
            </dialog>
          </li>
          <li className="relation-overview__header__list__item">
            <CreateMode></CreateMode>
          </li>
        </ul>
      </header>
      <section className={"relation-overview__relations"}>
        <RelationsMain
          viewCheckResults={viewCheckResults}
          currentId={currentId}
        ></RelationsMain>
      </section>
    </main>
  );
};
