import { select, selection } from 'd3-selection';
import { linkHorizontal } from 'd3-shape';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { IRelation, IScrollTopMap } from '../types';
import getLeftMiddleRightScrollTopMaps from './getLeftMiddleRightScrollTopMaps';
import getLinks from './getLinks';
import { createElement, FC } from 'react';
import { createRoot } from 'react-dom/client';

(selection.prototype as any).rc = function(reactComponent: any) {
  if (!reactComponent) {
    return;
  }

  const initReactComponent = function(this: any, data: any) {
    createRoot(this).render(createElement(reactComponent, data));
  };

  this.each(initReactComponent);
};

const optionsWidth = 150;
const optionsHeight = 24;

export default class {
  public fromEditor: monaco.editor.IStandaloneCodeEditor;
  public toEditor: monaco.editor.IStandaloneCodeEditor;
  public relations: IRelation[];
  public svgEl: SVGSVGElement;
  public fromContainerDomNode?: HTMLElement;
  public toContainerDomNode?: HTMLElement;
  public options?: FC<any>;

  private leftMiddleRightScrollTopMaps: IScrollTopMap[];
  private middleTop: number = 0;
  private linkEl: SVGSVGElement;

  constructor(
    fromEditor: monaco.editor.IStandaloneCodeEditor,
    toEditor: monaco.editor.IStandaloneCodeEditor,
    relations: IRelation[],
    svgEl: SVGSVGElement,
    {
      fromContainerDomNode,
      toContainerDomNode,
      options,
    }: {
      fromContainerDomNode?: HTMLElement;
      toContainerDomNode?: HTMLElement;
      options?: FC<any>;
    } = {}
  ) {
    this.fromEditor = fromEditor;
    this.toEditor = toEditor;
    this.relations = relations;
    this.svgEl = svgEl;
    this.linkEl = svgEl;
    this.fromContainerDomNode = fromContainerDomNode;
    this.toContainerDomNode = toContainerDomNode;
    this.options = options;

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

  public scrollToRelation(id: string) {
    const relation = this.relations.find(relation => relation.id === id);
    if (!relation) {
      return;
    }
    const fromLine = relation.fromRange[0];
    const leftTop = this.fromEditor.getTopForLineNumber(fromLine);

    this.fromEditor.setScrollTop(leftTop);
    const middleTop = this.getMiddleTopFromLeftTop(leftTop);
    this.middleTop = middleTop;
    const rightTop = this.getRightTopFromMiddleTop(middleTop);
    this.toEditor.setScrollTop(rightTop);
  }

  public onDetailClick(event: any) {
    document.dispatchEvent(
      new CustomEvent('relationDetailButtonClick', {
        detail: {
          id: event.target.getAttribute('relation-id'),
        },
      })
    );
  }

  public onDeleteClick(event: any) {
    document.dispatchEvent(
      new CustomEvent('relationDeleteButtonClick', {
        detail: {
          id: event.target.getAttribute('relation-id'),
        },
      })
    );
  }

  public getMiddleTopFromLeftTop(leftTop: number): number {
    const current = this.leftMiddleRightScrollTopMaps.find(d => {
      if (d[0][0] <= leftTop && d[0][1] >= leftTop) {
        return true;
      }
      return false;
    });

    if (current) {
      const ratio = (leftTop - current[0][0]) / (current[0][1] - current[0][0]);

      return current[1][0] + (current[1][1] - current[1][0]) * ratio;
    } else {
      const lastLeftMiddleRight = this.leftMiddleRightScrollTopMaps.at(-1);
      if (lastLeftMiddleRight) {
        return lastLeftMiddleRight[1][1];
      }
      return leftTop;
    }
  }

  private getRightTopFromMiddleTop(middleTop: number) {
    const current = this.leftMiddleRightScrollTopMaps.find(d => {
      if (d[1][0] <= middleTop && d[1][1] >= middleTop) {
        return true;
      }
      return false;
    });

    if (current) {
      const ratio =
        (middleTop - current[1][0]) / (current[1][1] - current[1][0]);

      return current[2][0] + (current[2][1] - current[2][0]) * ratio;
    } else {
      const lastLeftMiddleRight = this.leftMiddleRightScrollTopMaps.at(-1);
      if (lastLeftMiddleRight) {
        return lastLeftMiddleRight[2][1];
      }
      return middleTop;
    }
  }

  private syncEditor() {
    (this.fromEditor as any).onMouseWheel((event: any) =>
      this.onMouseWheel(event)
    );
    (this.toEditor as any).onMouseWheel((event: any) =>
      this.onMouseWheel(event)
    );
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
    const fromStartLine = fromSelection!.getStartPosition().lineNumber;
    const fromEndLine = fromSelection!.getEndPosition().lineNumber;
    const toStartLine = toSelection!.getStartPosition().lineNumber;
    const toEndLine = toSelection!.getEndPosition().lineNumber;

    document.dispatchEvent(
      new CustomEvent('relationCreateRangeChange', {
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

  private onMouseWheel(event: any) {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();

    this.middleTop += event.deltaY;

    if (this.middleTop < 0) {
      this.middleTop = 0;
      this.fromEditor.setScrollTop(0);
      this.toEditor.setScrollTop(0);
    }

    const current = this.leftMiddleRightScrollTopMaps.find(d => {
      if (d[1][0] <= this.middleTop && d[1][1] >= this.middleTop) {
        return true;
      }
      return false;
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
      if (lastLeftMiddleRight) {
        this.middleTop = lastLeftMiddleRight[1][1];
        this.fromEditor.setScrollTop(lastLeftMiddleRight[0][1]);
        this.toEditor.setScrollTop(lastLeftMiddleRight[2][1]);
      } else {
        this.fromEditor.setScrollTop(this.middleTop);
        this.toEditor.setScrollTop(this.middleTop);
      }
    }

    // scroll X
    window.scrollBy(event.deltaX, 0);
  }

  public renderLinks() {
    const links = getLinks({
      fromEditor: this.fromEditor,
      toEditor: this.toEditor,
      relations: this.relations,
      fromContainerDomNode: this.fromContainerDomNode,
      toContainerDomNode: this.toContainerDomNode,
    });

    const rangeLinkHorizontalGen = rangeLinkHorizontal();

    const optionsXGen = (d: any) => d.target[1][0] - optionsWidth;

    const optionsYGen = (d: any) => d.target[1][1];

    select(this.linkEl)
      .selectAll('.relation-link')
      .data(links)
      .join(
        enter => {
          const group = enter.append('g').attr('class', 'relation-link');

          group
            .append('path')
            .attr('class', (link: any) => `${link.type}`)
            .attr('fill', 'none')
            .attr('stroke-width', 1)
            .attr('d', rangeLinkHorizontalGen)
            .style('opacity', 0.15);

          const options = group.append('foreignObject');

          options
            .attr('class', 'relation-link__options')
            .attr('x', optionsXGen)
            .attr('y', optionsYGen)
            .attr('width', optionsWidth)
            .attr('height', optionsHeight);

          const optionsBody = options.append('xhtml:body');

          optionsBody.attr('class', 'relation-options');

          optionsBody
            .append('button')
            .text('detail')
            .attr('class', 'relation-options__detail')
            .attr('relation-id', (d: any) => d.id)
            .on('click', this.onDetailClick);

          optionsBody
            .append('button')
            .text('delete')
            .attr('class', 'relation-options__delete')
            .attr('relation-id', (d: any) => d.id)
            .on('click', this.onDeleteClick);

          const customOptionsDiv = optionsBody
            .append('div')
            .attr('class', 'relation-options__custom');

          (customOptionsDiv as any).rc(this?.options);

          return enter;
        },
        update => {
          // console.log("update", update);
          update.select('path').attr('d', rangeLinkHorizontalGen);

          update
            .select('.relation-link__options')
            .attr('x', optionsXGen)
            .attr('y', optionsYGen);

          return update;
        },
        exit => {
          // console.log("exit", exit);
          exit.remove();
        }
      );
  }
}

function rangeLinkHorizontal() {
  const linkHorizontalGen = linkHorizontal();
  return function(d: any) {
    const lineTop1 = linkHorizontalGen({
      source: d.source[0],
      target: d.source[1],
    });

    const lineTop2 = linkHorizontalGen({
      source: d.source[1],
      target: d.target[0],
    })!.replace(/^M.*C/, 'C');

    const lineTop3 = linkHorizontalGen({
      source: d.target[0],
      target: d.target[1],
    })!.replace(/^M.*C/, 'C');

    const lineRight = `L${d.target[2][0]} ${d.target[2][1]}`;

    const lineBottom1 = linkHorizontalGen({
      source: d.target[2],
      target: d.target[3],
    })!.replace(/^M.*C/, 'C');

    const lineBottom2 = linkHorizontalGen({
      source: d.target[3],
      target: d.source[2],
    })!.replace(/^M.*C/, 'C');

    const lineBottom3 = linkHorizontalGen({
      source: d.source[2],
      target: d.source[3],
    })!.replace(/^M.*C/, 'C');

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
