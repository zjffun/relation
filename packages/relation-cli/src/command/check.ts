import { Command } from "commander";
import fse from "fs-extra";
import pick from "lodash/pick.js";
import path from "node:path";
import { groupByKey, RelationServer, sha1 } from "relation2-core";
import stringifyJsonScriptContent from "stringify-json-script-content";
import baseDirname from "../baseDirname.js";

const pkgInfo = JSON.parse(
  fse.readFileSync(path.resolve(baseDirname, "..", "package.json")).toString()
);

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

      const relationServer = new RelationServer();

      const relations = await relationServer.filter((relation) => {
        return (
          path.join(
            relationServer.workingDirectory,
            relation.fromGitWorkingDirectory,
            relation.fromPath
          ) === from
        );
      });

      const relationsGroupByKey = groupByKey(relations);

      if (opts.output === "html") {
        await outputHtml(relationsGroupByKey, relationServer);
        return;
      }

      await outputJson(relationsGroupByKey, relationServer);
    });
}

async function outputHtml(relationsGroupByKey, relationServer: RelationServer) {
  const resultPath = path.join(process.cwd(), "relation-check-result");

  fse.emptyDirSync(resultPath);

  const results = [];

  for (const [key, relations] of Object.entries(relationsGroupByKey)) {
    const data = await getViewData(relations, relationServer);
    const id = sha1(data);

    results.push({
      key: key,
      id,
    });

    const escapedViewDataJSONString = stringifyJsonScriptContent(data, null, 2);

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${id} - Relation</title>
    </head>
    <body>
      <div id="root">
      </div>
      <script id="viewDataText" type="application/json">
        ${escapedViewDataJSONString}
      </script>
      <script>
        window.__VIEW_DATA__ = JSON.parse(document.getElementById('viewDataText').textContent);
      </script>
      <script src="https://cdn.jsdelivr.net/npm/relation2-page@${pkgInfo.version}/dist/relationPreviewView.js"></script>
    </body>
    </html>`;

    fse.writeFileSync(path.join(resultPath, `${id}.html`), html);
  }

  const resultsJSONString = JSON.stringify(Array.from(results), null, 2);

  fse.writeFileSync(
    path.join(resultPath, "check-results-data.json"),
    resultsJSONString
  );
}

async function outputJson(resultGroupByKey, relationServer: RelationServer) {
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

  for (const [key, relations] of Object.entries(resultGroupByKey)) {
    const data = await getViewData(relations, relationServer);
    const id = sha1(data);

    results.push({
      key: key,
      id,
    });

    const dataJSONString = JSON.stringify(data, null, 2);

    fse.writeFileSync(path.join(previewsPath, `${id}.json`), dataJSONString);
  }

  const resultsJSONString = JSON.stringify(Array.from(results), null, 2);

  fse.writeFileSync(
    path.join(resultPath, "check-results-data.json"),
    resultsJSONString
  );
}

async function getViewData(relations, relationServer: RelationServer) {
  const relationsWithContents = await relationServer.getRelationsWithContentsByRelations(
    relations
  );

  return relationsWithContents;
}
