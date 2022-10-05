import { writeFileSync } from "node:fs";
import { IOptions, IRawRelation } from "../types.js";
import { getInfo } from "./getInfo.js";

export default async (relations: IRawRelation[], relationFilePath: string) => {
  writeFileSync(relationFilePath, JSON.stringify(relations, null, 2));
};
