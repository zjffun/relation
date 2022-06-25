import { Command } from "commander";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { updateRelation } from "../updateRelation.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getRange = (value, dummyPrevious) => {
  if (!value) {
    return false;
  }
  try {
    const array = value.split(",").map((d) => parseInt(d, 10));

    if (Number.isInteger(array[0]) && Number.isInteger(array[1])) {
      return [array[0], array[1]];
    }

    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export default function (program: Command) {
  program
    .command("update")
    .option("--id <string>")
    .option("--srcRev <string>", "source reversion", "HEAD")
    .option("--rev <string>", "reversion", "HEAD")
    .option("--srcPath <string>", "", "")
    .option("--path <string>", "", "")
    .option("--srcRange <string>", "startLine,endLine", getRange)
    .option("--range <string>", "startLine,endLine", getRange)
    .action((opts) => {
      updateRelation(opts);
    });
}
