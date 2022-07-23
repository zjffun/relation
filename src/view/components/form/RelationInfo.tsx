import classnames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import { IFormData } from "../../form";

import "./RelationInfo.scss";

const RelationInfoItems = ({
  prefix,
  value,
  onChange,
}: {
  prefix: string;
  value: IFormData;
  onChange(formData: IFormData): void;
}) => {
  let showLine = true;
  let showRev = true;

  switch (value[`${prefix}.formConfig`]) {
    case "file":
      showLine = false;
      showRev = false;
      break;
    case "revFile":
      showLine = false;
      break;
    case "fileLine":
      showRev = false;
      break;
    case "revFileLine":
      break;
    case "withoutModification":
      return <>without modification</>;
  }

  const handleChange = (e) => {
    onChange({
      ...value,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      {showLine ? (
        <>
          <span>
            line{" "}
            <input
              name={`${prefix}.startLine`}
              value={value[`${prefix}.startLine`]}
              type="number"
              placeholder="start line"
              onChange={handleChange}
            />{" "}
            to{" "}
            <input
              name={`${prefix}.endLine`}
              value={value[`${prefix}.endLine`]}
              type="number"
              placeholder="end line"
              onChange={handleChange}
            />
          </span>
          <span> of </span>
        </>
      ) : null}
      <input
        name={`${prefix}.path`}
        value={value[`${prefix}.path`]}
        type="text"
        placeholder="path"
        onChange={handleChange}
      />
      {showRev ? (
        <>
          <span> of </span>
          <span>
            <input
              name={`${prefix}.revision`}
              value={value[`${prefix}.revision`]}
              type="text"
              placeholder="revision"
              onChange={handleChange}
            />
          </span>
        </>
      ) : null}
    </>
  );
};

export default ({
  prefix,
  value,
  onChange,
}: {
  prefix: string;
  value: IFormData;
  onChange(formData: IFormData): void;
}) => {
  const [showConfigRadios, setShowConfigRadios] = useState(false);

  const formConfigSelectName = `${prefix}.formConfig`;

  return (
    <>
      <RelationInfoItems
        prefix={prefix}
        value={value}
        onChange={onChange}
      ></RelationInfoItems>
      <span className="relation-form-config">
        <label
          onClick={() => {
            setShowConfigRadios((d) => !d);
          }}
        >
          ⚙️
        </label>
        <div
          className={classnames("relation-form-config__radios", {
            "relation-form-config__radios--hide": !showConfigRadios,
          })}
        >
          <ul>
            <li>
              <input
                name={formConfigSelectName}
                checked={value[formConfigSelectName] === "file"}
                value="file"
                type="radio"
                onChange={() => {
                  onChange({
                    ...value,
                    [formConfigSelectName]: "file",
                  });
                  setShowConfigRadios(false);
                }}
              />
              <label>file</label>
            </li>
            <li>
              <label>
                <input
                  name={formConfigSelectName}
                  checked={value[formConfigSelectName] === "fileLine"}
                  value="fileLine"
                  type="radio"
                  onChange={() => {
                    onChange({
                      ...value,
                      [formConfigSelectName]: "fileLine",
                    });
                    setShowConfigRadios(false);
                  }}
                />
                file and line
              </label>
            </li>
            <li>
              <label>
                <input
                  name={formConfigSelectName}
                  checked={value[formConfigSelectName] === "revFileLine"}
                  value="revFileLine"
                  type="radio"
                  onChange={() => {
                    onChange({
                      ...value,
                      [formConfigSelectName]: "revFileLine",
                    });
                    setShowConfigRadios(false);
                  }}
                />
                rev, file and line
              </label>
            </li>
            <li>
              <label>
                <input
                  name={formConfigSelectName}
                  checked={
                    value[formConfigSelectName] === "withoutModification"
                  }
                  value="withoutModification"
                  type="radio"
                  onChange={() => {
                    onChange({
                      ...value,
                      [formConfigSelectName]: "withoutModification",
                    });
                    setShowConfigRadios(false);
                  }}
                />
                without modification
              </label>
            </li>
          </ul>
        </div>
      </span>
    </>
  );
};
