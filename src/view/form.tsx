import React, { FC, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import OperationTypeSelect from "./components/form/OperationTypeSelect";
import RelationFormTo from "./components/form/RelationFormTo";

export interface IFormData {
  operationType: string;
}

const Page = () => {
  const [formData, setFormData] = useState<IFormData>({
    operationType: "create",
  });

  const _setFormData = (key, value) => {
    setFormData((d) => {
      return {
        ...d,
        [key]: value,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    document.dispatchEvent(
      new CustomEvent("submitRelationFormData", {
        detail: formData,
      })
    );

    // TODO: TS2339: Property 'entries' does not exist on type 'FormData'.
    // const entries = (formData as any).entries();
    // console.log([...entries]);
  };

  useEffect(() => {
    document.addEventListener("setRelationFormData", (e: any) => {
      if (e.detail.merge) {
        setFormData((d) => {
          return {
            ...d,
            ...e.detail.formData,
          };
        });
        return;
      }

      setFormData(e.detail.formData);
    });
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <OperationTypeSelect
          value={formData.operationType}
          onChange={(d) => _setFormData("operationType", d)}
        ></OperationTypeSelect>
        <RelationFormTo
          prefix="source"
          value={formData}
          onChange={setFormData}
        ></RelationFormTo>
        {formData.operationType === "update" ? (
          <span>
            <span>, to</span>
            <RelationFormTo
              prefix="target"
              value={formData}
              onChange={setFormData}
            ></RelationFormTo>
          </span>
        ) : (
          <span>.</span>
        )}
        <button>Submit</button>
      </form>
    </>
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
