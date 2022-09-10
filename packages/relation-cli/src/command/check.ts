import { Command } from "commander";
import fse from "fs-extra";
import pick from "lodash/pick.js";
import crypto from "node:crypto";
import path from "node:path";
import {
  checkRelations,
  getOriginalAndModifiedContent,
  groupByKey,
} from "relation2-core";
import stringifyJsonScriptContent from "stringify-json-script-content";
import baseDirname from "../baseDirname.js";

import pkgInfo from "../../package.json";

export default function(program: Command) {
  program
    .command("check")
    .option("--from <string>", "")
    .option("--output <boolean>", "", "json")
    .action(async (opts) => {
      let from;

      if (opts.from) {
        if (path.isAbsolute(opts.from)) {
          from = opts.from;
        } else {
          from = path.join(process.cwd(), opts.from);
        }
      }

      const checkResults = await checkRelations({
        from,
      });

      const resultGroupByKey = groupByKey(checkResults);

      if (opts.output === "html") {
        await outputHtml(resultGroupByKey);
        return;
      }

      await outputJson(resultGroupByKey);
    });
}

async function outputHtml(resultGroupByKey) {
  const resultPath = path.join(process.cwd(), "relation-check-result");

  fse.emptyDirSync(resultPath);

  const results = [];

  for (const result of Object.entries(resultGroupByKey)) {
    const data = await getViewCheckResult(result);

    results.push({
      key: data.key,
      id: data.id,
    });

    const escapedViewCheckResultsJSONString = stringifyJsonScriptContent(
      data,
      null,
      2
    );

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.id} - Relation</title>
    </head>
    <body>
      <div id="root">
      </div>
      <script id="viewCheckResultsText" type="application/json">
        ${escapedViewCheckResultsJSONString}
      </script>
      <script>
        window.__VIEW_CHECK_RESULTS__ = JSON.parse(document.getElementById('viewCheckResultsText').textContent);
      </script>
      <script src="https://cdn.jsdelivr.net/npm/relation2-page@${pkgInfo.version}/dist/relationPreviewView.js"></script>
    </body>
    </html>`;

    fse.writeFileSync(path.join(resultPath, `${data.id}.html`), html);
  }

  const resultsJSONString = JSON.stringify(Array.from(results), null, 2);

  fse.writeFileSync(
    path.join(resultPath, "check-results-data.json"),
    resultsJSONString
  );
}

async function outputJson(resultGroupByKey) {
  const resultPath = path.join(process.cwd(), "relation-check-result");

  fse.emptyDirSync(resultPath);

  const results = [];

  // TODO: fix find relation-page
  fse.copySync(
    path.join(baseDirname, "..", "node_modules", "relation2-page", "dist"),
    resultPath,
    {
      overwrite: true,
    }
  );

  const previewsPath = path.join(resultPath, "previews");

  fse.mkdirSync(previewsPath);

  for (const result of Object.entries(resultGroupByKey)) {
    const data = await getViewCheckResult(result);

    results.push({
      key: data.key,
      id: data.id,
      dirty: data.checkResults.some((checkResult) => checkResult.dirty),
    });

    const dataJSONString = JSON.stringify(data, null, 2);

    fse.writeFileSync(
      path.join(previewsPath, `${data.id}.json`),
      dataJSONString
    );
  }

  const resultsJSONString = JSON.stringify(Array.from(results), null, 2);

  fse.writeFileSync(
    path.join(resultPath, "check-results-data.json"),
    resultsJSONString
  );
}

async function getViewCheckResult(result) {
  const [key, checkResults] = result;
  const viewCheckResults = checkResults.map((checkResult) => {
    return pick(checkResult, [
      "id",
      "fromRange",
      "toRange",
      "fromRev",
      "toRev",
      "dirty",
      "fromModifiedRange",
      "toModifiedRange",
    ]);
  });

  return {
    key,
    id: crypto
      .createHash("sha1")
      .update(JSON.stringify(checkResults))
      .digest("hex"),
    checkResults: viewCheckResults,
    dirty: result.dirty,
    ...pick(checkResults[0], [
      "fromPath",
      "fromBaseDir",
      "toPath",
      "toBaseDir",
      "currentFromRev",
      "currentToRev",
    ]),
    originalAndModifiedContent: await getOriginalAndModifiedContent({
      checkResults: checkResults as any,
      relationsKey: key,
    }),
  };
}
