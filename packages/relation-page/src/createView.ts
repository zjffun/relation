import { select, Selection } from "d3-selection";

import MonacoRelationView from "./relationView/MonacoRelationView";

export function createView(selector, { texts, relationsArray, currentId }) {
  const container = select(selector);
  const viewContainer = container
    .append("div")
    .attr("class", "relation-view-container");

  const textsEl = viewContainer
    .append("div")
    .attr("class", "relation-view-texts");

  const editors = initEditors(textsEl, texts);

  initRelations(editors, relationsArray, viewContainer, currentId);
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

    const formEditor = editors[i];
    const toEditor = editors[i + 1];
    const monacoRelationView = new MonacoRelationView(
      formEditor,
      toEditor,
      relationsArray[i],
      svg
    );

    if (currentId) {
      monacoRelationView.scrollToRelation(currentId);
    }
  }
}
