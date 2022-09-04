import { select, Selection } from "d3-selection";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { ICheckResultView, RelationTypeEnum } from "../types";

import MonacoRelationView from "./relationView/MonacoRelationView";

export async function createRelationsView(
  selector,
  {
    viewCheckResults,
    currentId,
  }: {
    viewCheckResults: ICheckResultView;
    currentId: number;
  }
) {
  // texts, diffTexts, relationsArray,

  const container = select(selector);
  const viewContainer = container
    .append("div")
    .attr("class", "relation-view-container");

  const textsEl = viewContainer
    .append("div")
    .attr("class", "relation-view-texts");

  const editors = [];
  editors.push(
    await initDiffEditor(
      textsEl,
      viewCheckResults.originalAndModifiedContent.fromOriginalContent,
      viewCheckResults.originalAndModifiedContent.fromModifiedContent
    )
  );
  editors.push(
    await initDiffEditor(
      textsEl,
      viewCheckResults.originalAndModifiedContent.toOriginalContent,
      viewCheckResults.originalAndModifiedContent.toModifiedContent
    )
  );

  initRelations(
    editors,
    [
      viewCheckResults.checkResults.map((d) => {
        return {
          id: d.id,
          fromRange: d.fromModifiedRange,
          toRange: d.toModifiedRange,
          type: d.dirty ? RelationTypeEnum.dirty : RelationTypeEnum.relate,
        };
      }),
    ],
    viewContainer,
    currentId
  );
}

async function initDiffEditor(
  textsEl: Selection<HTMLDivElement, unknown, null, undefined>,
  originalContent,
  modifiedContent
) {
  const textEl = textsEl
    .append("div")
    .attr("class", "relation-view-texts__text");

  const diffEditor = MonacoRelationView.createDiffEditor(textEl.node(), {
    renderSideBySide: false,
    diffWordWrap: "on",
  });

  diffEditor.setModel({
    original: monaco.editor.createModel(originalContent, "markdown"),
    modified: monaco.editor.createModel(modifiedContent, "markdown"),
  });

  // wait for diff ready
  await new Promise((res) => {
    diffEditor.onDidUpdateDiff(() => {
      res(undefined);
    });
  });

  return diffEditor;
}

function initEditors(
  textsEl: Selection<HTMLDivElement, unknown, null, undefined>,
  texts
) {
  const editors = [];
  texts.forEach((text) => {
    const textEl = textsEl
      .append("div")
      .attr("class", "relation-view-texts__text");

    const editor = MonacoRelationView.createEditor(textEl.node(), {
      value: text,
    });

    editors.push(editor);
  });

  return editors;
}

function initRelations(editors, relationsArray, viewContainer, currentId) {
  for (let i = 0; i < editors.length - 1; i++) {
    const svg = viewContainer
      .append("svg")
      .attr("class", "relation-view-svg")
      .style("width", `100vw`)
      .style("margin", `0 0 0 calc(${i * 50}vw + ${i}rem)`);

    const linksEl = svg.append("g").attr("class", "relation-view-svg__links");

    relationsArray.forEach(() => {
      linksEl.append("g").attr("class", "relation-view-svg__links__link");
    });

    const formEditor = editors[i].getModifiedEditor();
    const toEditor = editors[i + 1].getModifiedEditor();
    const monacoRelationView = new MonacoRelationView(
      formEditor,
      toEditor,
      relationsArray[i],
      svg,
      {
        fromContainerDomNode: editors[i].getContainerDomNode(),
        toContainerDomNode: editors[i + 1].getContainerDomNode(),
      }
    );

    if (currentId) {
      monacoRelationView.scrollToRelation(currentId);
    }
  }
}
