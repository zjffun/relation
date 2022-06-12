import React, { useEffect, useRef } from "react";
import { createView } from "../createView";

export default ({ relation }) => {
  const ref = useRef(null);

  useEffect(() => {
    createView(ref.current, relation);
  }, []);

  return <section className="relation-container" ref={ref}></section>;
};
