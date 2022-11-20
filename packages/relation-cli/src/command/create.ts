import { Command } from "commander";
import { RelationServer } from "relation2-core";

export default function(program: Command) {
  program
    .command("create")
    .option("--srcRev <string>", "source reversion", "HEAD")
    .option("--rev <string>", "reversion", "HEAD")
    .option("--srcPath <string>", "", "")
    .option("--path <string>", "", "")
    .action(async (opts) => {
      const relationServer = new RelationServer();

      const relations = await relationServer.read();
      const newRelations = await relationServer.createMarkdownRelations({
        fromAbsolutePath: opts.srcPath,
        toAbsolutePath: opts.path,
      });

      relationServer.write([...relations, ...newRelations]);
    });
}
