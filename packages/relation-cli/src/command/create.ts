import { Command } from "commander";
import { createRelation } from "relation2-core";

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
