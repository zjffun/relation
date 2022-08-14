import React, { useEffect, useRef } from "react";
import { createView } from "../createView";

import "./RelationComponent.scss";

export default ({ relation }) => {
  const ref = useRef(null);

  useEffect(() => {
    createView(ref.current, relation);
  }, []);

  return <div className="relation-component" ref={ref}></div>;
};
