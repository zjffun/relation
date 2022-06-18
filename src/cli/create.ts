import { Command } from "commander";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRelation } from "../createRelation.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function (program: Command) {
  program
    .command("create")
    .option("--srcRev <string>", "source reversion", "HEAD")
    .option("--rev <string>", "reversion", "HEAD")
    .option("--srcPath <string>", "", "")
    .option("--path <string>", "", "")
    .action((opts) => {
      createRelation(opts);
    });
}
