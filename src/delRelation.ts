import { join } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";

export const delRelation = (id: string) => {
  const filePath = join(process.cwd(), ".relation", "relation.json");
  const buffer = readFileSync(filePath);
  const json = JSON.parse(buffer.toString());

  json.filter((d) => d.id !== id);

  writeFileSync(filePath, json.toString());
};
