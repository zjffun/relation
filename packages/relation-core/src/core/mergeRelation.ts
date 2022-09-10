import { IRawRelation } from "../types";

export default function(
  relation: IRawRelation,
  newRelation: Partial<IRawRelation>
) {
  const keys = [
    "id",
    "fromRev",
    "fromBaseDir",
    "fromPath",
    "fromRange",
    "toRev",
    "toBaseDir",
    "toPath",
    "toRange",
  ];

  const result = { ...relation };

  for (const k of keys) {
    if (newRelation[k]) {
      result[k] = newRelation[k];
    }
  }

  return result;
}
