import { Command } from "commander";
import { RelationServer } from "relation2-core";

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

export default function(program: Command) {
  program
    .command("update")
    .option("--id <string>")
    .option("--fromPath <string>", "", "")
    .option("--toPath <string>", "", "")
    .option("--fromRange <string>", "startLine,endLine", getRange)
    .option("--toRange <string>", "startLine,endLine", getRange)
    .action((opts) => {
      const relationServer = new RelationServer();
      relationServer.updateById(opts.id, (relation) => {
        relation.fromPath = opts.fromPath;
        relation.toPath = opts.toPath;
        relation.fromRange = opts.fromRange;
        relation.toRange = opts.toRange;
        return relation;
      });
    });
}
