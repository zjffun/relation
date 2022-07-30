import { Command } from "commander";
import fse from "fs-extra";
import path from "node:path";
import { checkRelations } from "../checkRelations";
import baseDirname from "../baseDirname";

export default function (program: Command) {
  program.command("check").action(async () => {
    const result = await checkRelations();
    const resultJSONString = JSON.stringify(
      Array.from(result.values()),
      (key, value: any) => {
        if (value instanceof Map) {
          return Array.from(value.entries());
        }
        return value;
      },
      2
    );
    const resultJSString = `window.checkResults = ${resultJSONString};`;

    const resultPath = path.join(process.cwd(), "relation-check-result");

    fse.copySync(path.join(baseDirname, "view"), resultPath, {
      overwrite: true,
    });

    fse.writeFileSync(
      path.join(resultPath, "check-results-data"),
      resultJSString
    );
  });
}
