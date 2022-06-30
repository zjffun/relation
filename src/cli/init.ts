import { Command } from "commander";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fse from "fs-extra";
import { getInfo } from "../core/getInfo";

const { readFileSync, writeFileSync, ensureFileSync } = fse;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function (program: Command) {
  program.command("init").action((options) => {
    const { cwd, srcCwd, config } = getInfo(options);

    const relationFilePath = path.join(cwd, ".relation", "relation.json");

    ensureFileSync(relationFilePath);

    const relationBuffer = readFileSync(relationFilePath);

    if (!relationBuffer.toString()) {
      writeFileSync(relationFilePath, "[]");
    }
  });
}
