import React, { useEffect, useRef } from "react";
import { createRelationsView } from "../createRelationsView";

import "./RelationsMain.scss";

export default ({ viewCheckResults, currentId }) => {
  const ref = useRef(null);

  useEffect(() => {
    createRelationsView(ref.current, {
      viewCheckResults,
      currentId,
    });
  }, []);

  return <div className="relation-component" ref={ref}></div>;
};
