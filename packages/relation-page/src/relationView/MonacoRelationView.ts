import { linkHorizontal } from "d3-shape";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import getLeftMiddleRightScrollTopMaps from "./getLeftMiddleRightScrollTopMaps";
import getLinks from "./getLinks";

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
  }

  private syncEditor() {
    (this.fromEditor as any).onMouseWheel((event) => this.onMouseWheel(event));
    (this.toEditor as any).onMouseWheel((event) => this.onMouseWheel(event));
  }

  private syncRelation() {
    this.fromEditor.onDidScrollChange(() => this.onDidScrollChange());
    this.toEditor.onDidScrollChange(() => this.onDidScrollChange());
  }

  private onDidScrollChange() {
    this.renderLinks();
  }

  private onMouseWheel(event) {
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

    const link = this.linkEl
      .selectAll(".link")
      .data(links)
      .join(
        (enter) => {
          enter
            .append("path")
            .attr("class", (link) => `link ${link.type}`)
            .attr("fill", "none")
            .attr("stroke-width", 1)
            .attr("d", rangeLinkHorizontalGen)
            .style("opacity", 0.65);
        },
        (update) => {
          // console.log("update", update);
          update.attr("d", rangeLinkHorizontalGen);
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
