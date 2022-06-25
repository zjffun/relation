import { IRawRelation } from "../index.d";

export default function (
  relation: IRawRelation,
  newRelation: Partial<IRawRelation>
) {
  const keys = ["id", "rev", "path", "range", "srcRev", "srcPath", "srcRange"];

  const result = { ...relation };

  for (const k of keys) {
    if (newRelation[k]) {
      result[k] = newRelation[k];
    }
  }

  return result;
}
