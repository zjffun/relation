import { Command } from "commander";
import filenamify from "filenamify";
import fse from "fs-extra";
import path from "node:path";
import { IRelationViewerData, RelationServer, sha1 } from "relation2-core";
import stringifyJsonScriptContent from "stringify-json-script-content";
import baseDirname from "../baseDirname.js";

const pkgInfo = JSON.parse(
  fse.readFileSync(path.resolve(baseDirname, "..", "package.json")).toString()
);

export default function(program: Command) {
  program
    .command("check")
    .option("--from <string>", "")
    .option("--to <string>", "")
    .option("--output <boolean>", "", "html")
    .action(async (opts) => {
      const relationServer = new RelationServer();

      const relations = this.filter(
        (relation) =>
          relation.fromAbsolutePath === relation.getAbsolutePath(opts.from) &&
          relation.toAbsolutePath === relation.getAbsolutePath(opts.to)
      );

      const relationViewerData = await relationServer.getRelationViewerData(
        relations
      );

      if (opts.output === "html") {
        await outputHtml(relationViewerData);
        return;
      }
    });
}

async function outputHtml(relationViewerData: IRelationViewerData) {
  const resultPath = path.join(process.cwd(), "relation-check-result");

  fse.emptyDirSync(resultPath);

  const escapedRelationViewerDataJSONString = stringifyJsonScriptContent(
    relationViewerData,
    null,
    2
  );

  const relationFromTo = `${relationViewerData.fromPath} - ${relationViewerData.toPath}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${relationFromTo} - Relation</title>
    </head>
    <body>
      <div id="root">
      </div>
      <script id="escapedRelationViewerDataJSONString" type="application/json">
        ${escapedRelationViewerDataJSONString}
      </script>
      <script>
        window.__RELATION_VIEWER_DATA__ = JSON.parse(document.getElementById('escapedRelationViewerDataJSONString').textContent);
      </script>
      <script src="https://cdn.jsdelivr.net/npm/relation2-page@${pkgInfo.version}/dist/relationPreviewView.js"></script>
    </body>
    </html>`;

  const fileName = filenamify(relationFromTo);

  fse.writeFileSync(path.join(resultPath, `${fileName}.html`), html);
}
