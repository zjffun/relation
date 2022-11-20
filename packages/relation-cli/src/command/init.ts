import { Command } from "commander";
import { RelationServer } from "relation2-core";

export default function(program: Command) {
  program.command("init").action((options) => {
    const relationServer = new RelationServer();
    relationServer.init();
  });
}
