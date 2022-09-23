import { getKey } from "./core/getKey.js";
import createRelations from "./createRelations.js";
import filterRelation from "./filterRelation.js";
import { IOptions } from "./types";

export default async (options?: IOptions) => {
  await filterRelation((relation) => {
    // @ts-ignore
    if (getKey(relation) === getKey(options)) {
      return false;
    }
    return true;
  });
  await createRelations(options);
};
