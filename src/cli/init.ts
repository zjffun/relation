import { Command } from "commander";
import fse from "fs-extra";
import { getInfo } from "../core/getInfo.js";

const { readFileSync, writeFileSync, ensureFileSync } = fse;

export default function (program: Command) {
  program.command("init").action((options) => {
    const { relationFilePath } = getInfo(options);

    ensureFileSync(relationFilePath);

    const relationBuffer = readFileSync(relationFilePath);

    if (!relationBuffer.toString()) {
      writeFileSync(relationFilePath, "[]");
    }
  });
}
