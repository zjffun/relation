import { readFileSync } from "node:fs";
import { join } from "node:path";

let config;

export const getConfig = (cwd) => {
  const relationFilePath = join(cwd, ".relation", "config.json");

  try {
    const relationBuffer = readFileSync(relationFilePath);
    config = JSON.parse(relationBuffer.toString());
  } catch (error) {
    config = {};
  }

  return config;
};
