import React, { useEffect, useRef } from "react";

export default ({
  value,
  onChange,
}: {
  value: string;
  onChange(value: string): void;
}) => {
  return (
    <select
      name="operationType"
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
      }}
    >
      <option value="create">Create</option>
      <option value="update">Update</option>
      <option value="delete">Delete</option>
      <option value="check">Check</option>
    </select>
  );
};
