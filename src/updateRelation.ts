import { join } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { Relation } from "./Relation";

export const updateRelation = (id: string, obj: Relation) => {
  const filePath = join(process.cwd(), ".relation", "relation.json");
  const buffer = readFileSync(filePath);
  let json = JSON.parse(buffer.toString());

  json = json.map((d) => {
    if (d.id === id) {
      return obj;
    }
    return d;
  });

  writeFileSync(filePath, json.toString());
};
