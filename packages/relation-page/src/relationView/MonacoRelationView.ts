import { linkHorizontal } from "d3-shape";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import getLeftMiddleRightScrollTopMaps from "./getLeftMiddleRightScrollTopMaps";
import getLinks from "./getLinks";

const optionsWidth = 150;
const optionsHeight = 24;

export default class {
  public fromEditor: monaco.editor.IStandaloneCodeEditor;
  public toEditor: monaco.editor.IStandaloneCodeEditor;
  public relations;
  public container: SVGElement;

  private leftMiddleRightScrollTopMaps;
  private middleTop: number = 0;
  private linkEl;

  constructor(fromEditor, toEditor, relations, container) {
    this.fromEditor = fromEditor;
    this.toEditor = toEditor;
    this.relations = relations;
    this.container = container;
    this.linkEl = container.select(".relation-view-svg__links__link");

    this.leftMiddleRightScrollTopMaps = getLeftMiddleRightScrollTopMaps({
      fromEditor,
      toEditor,
      relations,
    });

    this.syncEditor();
    this.syncRelation();

    this.initCreate();

    this.renderLinks();
  }

  public onDetailClick(event) {
    document.dispatchEvent(
      new CustomEvent("relationDetailButtonClick", {
        detail: {
          id: event.target.getAttribute("relation-id"),
        },
      })
    );
  }

  public onDeleteClick(event) {
    document.dispatchEvent(
      new CustomEvent("relationDeleteButtonClick", {
        detail: {
          id: event.target.getAttribute("relation-id"),
        },
      })
    );
  }

  private syncEditor() {
    (this.fromEditor as any).onMouseWheel((event) => this.onMouseWheel(event));
    (this.toEditor as any).onMouseWheel((event) => this.onMouseWheel(event));
  }

  private syncRelation() {
    this.fromEditor.onDidScrollChange(() => this.onDidScrollChange());
    this.toEditor.onDidScrollChange(() => this.onDidScrollChange());
  }

  private initCreate() {
    this.fromEditor.onDidChangeCursorSelection(() =>
      this.onDidChangeCursorSelection()
    );
    this.toEditor.onDidChangeCursorSelection(() =>
      this.onDidChangeCursorSelection()
    );
  }

  private onDidChangeCursorSelection() {
    const fromSelection = this.fromEditor.getSelection();
    const toSelection = this.toEditor.getSelection();
    const fromStartLine = fromSelection.getStartPosition().lineNumber;
    const fromEndLine = fromSelection.getEndPosition().lineNumber;
    const toStartLine = toSelection.getStartPosition().lineNumber;
    const toEndLine = toSelection.getEndPosition().lineNumber;

    document.dispatchEvent(
      new CustomEvent("relationCreateRangeChange", {
        detail: {
          fromStartLine,
          fromEndLine,
          toStartLine,
          toEndLine,
        },
      })
    );
  }

  private onDidScrollChange() {
    this.renderLinks();
  }

  private onMouseWheel(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();

    this.middleTop += event.deltaY;

    if (this.middleTop < 0) {
      this.middleTop = 0;
      this.fromEditor.setScrollTop(0);
      this.toEditor.setScrollTop(0);
    }

    const current = this.leftMiddleRightScrollTopMaps.find((d) => {
      if (d[1][0] <= this.middleTop && d[1][1] >= this.middleTop) {
        return true;
      }
    });

    if (current) {
      const ratio =
        (this.middleTop - current[1][0]) / (current[1][1] - current[1][0]);

      const leftScrollTop =
        current[0][0] + (current[0][1] - current[0][0]) * ratio;

      const rightScrollTop =
        current[2][0] + (current[2][1] - current[2][0]) * ratio;
      this.fromEditor.setScrollTop(leftScrollTop);
      this.toEditor.setScrollTop(rightScrollTop);
    } else {
      const lastLeftMiddleRight = this.leftMiddleRightScrollTopMaps.at(-1);
      this.middleTop = lastLeftMiddleRight[1][1];
      this.fromEditor.setScrollTop(lastLeftMiddleRight[0][1]);
      this.toEditor.setScrollTop(lastLeftMiddleRight[2][1]);
    }
  }

  public renderLinks() {
    const links = getLinks({
      fromEditor: this.fromEditor,
      toEditor: this.toEditor,
      relations: this.relations,
    });

    const rangeLinkHorizontalGen = rangeLinkHorizontal();

    const optionsXGen = (d) => d.target[1][0] - optionsWidth;

    const optionsYGen = (d) => d.target[1][1];

    const link = this.linkEl
      .selectAll(".relation-link")
      .data(links)
      .join(
        (enter) => {
          const group = enter.append("g").attr("class", "relation-link");

          group
            .append("path")
            .attr("class", (link) => `${link.type}`)
            .attr("fill", "none")
            .attr("stroke-width", 1)
            .attr("d", rangeLinkHorizontalGen)
            .style("opacity", 0.65);

          const options = group.append("foreignObject");

          options
            .attr("class", "relation-link__options")
            .attr("x", optionsXGen)
            .attr("y", optionsYGen)
            .attr("width", optionsWidth)
            .attr("height", optionsHeight);

          const optionsBody = options.append("xhtml:body");

          optionsBody.attr("class", "relation-options");

          const detailBtn = optionsBody
            .append("button")
            .text("detail")
            .attr("class", "relation-options__detail")
            .attr("relation-id", (d) => d.id)
            .on("click", this.onDetailClick);

          const deleteBtn = optionsBody
            .append("button")
            .text("delete")
            .attr("class", "relation-options__delete")
            .attr("relation-id", (d) => d.id)
            .on("click", this.onDeleteClick);
        },
        (update) => {
          // console.log("update", update);
          update.select("path").attr("d", rangeLinkHorizontalGen);

          update
            .select(".relation-link__options")
            .attr("x", optionsXGen)
            .attr("y", optionsYGen);
        },
        (exit) => {
          // console.log("exit", exit);
          exit.remove();
        }
      );
  }

  static createEditor(domElement, options) {
    const editor = monaco.editor.create(domElement, {
      minimap: {
        enabled: false,
      },
      wordWrap: "on",
      readOnly: true,
      language: "markdown",
      theme: "vs-dark",
      ...options,
    });
    return editor;
  }
}

function rangeLinkHorizontal() {
  const linkHorizontalGen = linkHorizontal();
  return function (d) {
    const lineTop1 = linkHorizontalGen({
      source: d.source[0],
      target: d.source[1],
    });

    const lineTop2 = linkHorizontalGen({
      source: d.source[1],
      target: d.target[0],
    }).replace(/^M.*C/, "C");

    const lineTop3 = linkHorizontalGen({
      source: d.target[0],
      target: d.target[1],
    }).replace(/^M.*C/, "C");

    const lineRight = `L${d.target[2][0]} ${d.target[2][1]}`;

    const lineBottom1 = linkHorizontalGen({
      source: d.target[2],
      target: d.target[3],
    }).replace(/^M.*C/, "C");

    const lineBottom2 = linkHorizontalGen({
      source: d.target[3],
      target: d.source[2],
    }).replace(/^M.*C/, "C");

    const lineBottom3 = linkHorizontalGen({
      source: d.source[2],
      target: d.source[3],
    }).replace(/^M.*C/, "C");

    const lineLeft = `L${d.source[0][0]} ${d.source[0][1]}`;

    return (
      lineTop1 +
      lineTop2 +
      lineTop3 +
      lineRight +
      lineBottom1 +
      lineBottom2 +
      lineBottom3 +
      lineLeft
    );
  };
}
