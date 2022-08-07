import React from "react";
import { IFormData } from "../../form";
import RelationInfo from "./RelationInfo";

export default ({
  prefix,
  value,
  onChange,
}: {
  prefix: string;
  value: IFormData;
  onChange(formData: IFormData): void;
}) => {
  return (
    <>
      <span> relation from </span>
      <RelationInfo
        prefix={`${prefix}.from`}
        value={value}
        onChange={onChange}
      ></RelationInfo>
      <span> ot </span>
      <RelationInfo
        prefix={`${prefix}.to`}
        value={value}
        onChange={onChange}
      ></RelationInfo>
    </>
  );
};
