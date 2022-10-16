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
    if (k in newRelation) {
      result[k] = newRelation[k];
    }
  }

  return result;
}
