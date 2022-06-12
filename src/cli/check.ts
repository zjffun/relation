import { Command } from "commander";
import fse from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkRelations } from "../checkRelations.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function (program: Command) {
  program.command("check").action(() => {
    const result = checkRelations();
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

    fse.copySync(path.join(__dirname, "../view"), resultPath, {
      overwrite: true,
    });

    fse.writeFileSync(
      path.join(resultPath, "check-results-data.js"),
      resultJSString
    );
  });
}
