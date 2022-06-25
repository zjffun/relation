import { Command } from "commander";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fse from "fs-extra";

const { readFileSync, writeFileSync, ensureFileSync } = fse;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function (program: Command) {
  program.command("init").action(() => {
    let cwd = process.cwd();

    if (process.env.NODE_ENV === "test") {
      cwd = path.join(__dirname, "../tests/relation-test-repo");
    }

    const relationFilePath = path.join(cwd, ".relation", "relation.json");

    ensureFileSync(relationFilePath);

    const relationBuffer = readFileSync(relationFilePath);

    if (!relationBuffer.toString()) {
      writeFileSync(relationFilePath, "[]");
    }
  });
}
