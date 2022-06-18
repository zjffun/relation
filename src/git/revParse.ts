import { spawnSync } from "node:child_process";
import path, { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function revParse(rev) {
  let cwd = process.cwd();

  if (process.env.NODE_ENV === "test") {
    cwd = join(__dirname, "../../tests/relation-test-repo");
  }

  const result = spawnSync("git", ["rev-parse", `${rev}`], {
    cwd,
  });

  return result.stdout.toString().trim();
}
