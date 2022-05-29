import { join } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { Relation } from "./Relation";

export const addRelation = (obj: Relation) => {
  const filePath = join(process.cwd(), ".relation", "relation.json");
  const buffer = readFileSync(filePath);
  const json = JSON.parse(buffer.toString());

  json.push(new Relation(obj));

  writeFileSync(filePath, json.toString());
};
