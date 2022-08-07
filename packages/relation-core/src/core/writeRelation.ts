import { writeFileSync } from "node:fs";
import { IOptions, IRawRelation } from "../types.js";
import { getInfo } from "./getInfo.js";

export default async (relations: IRawRelation[], options: IOptions) => {
  const { relationFilePath } = getInfo(options);

  writeFileSync(relationFilePath, JSON.stringify(relations, null, 2));
};
