import { readFileSync, writeFileSync } from "node:fs";
import path, { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let config;

export const getConfig = () => {
  if (config !== undefined) {
    return config;
  }

  let cwd = process.cwd();

  if (process.env.NODE_ENV === "test") {
    cwd = join(__dirname, "../tests/relation-test-repo");
  }

  const relationFilePath = join(cwd, ".relation", "config.json");

  try {
    const relationBuffer = readFileSync(relationFilePath);
    config = JSON.parse(relationBuffer.toString());
  } catch (error) {
    config = {};
  }

  return config;
};
