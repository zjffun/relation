import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { IViewerContents, IViewerRelation } from '../bundled';

function createDiffEditor(domElement: HTMLElement) {
  // document.body.appendChild(domElement);
  // domElement.style.width = '100%';
  // domElement.style.height = '500px';

  const diffEditor = monaco.editor.createDiffEditor(domElement, {
    renderSideBySide: false,
    renderOverviewRuler: false,
  });

  diffEditor.setModel({
    original: monaco.editor.createModel(''),
    modified: monaco.editor.createModel(''),
  });
  return diffEditor;
}

async function setDiffEditorValue(
  diffEditor: monaco.editor.IStandaloneDiffEditor,
  original: string,
  modified: string
) {
  diffEditor.getModel()!.original.setValue(original);
  diffEditor.getModel()!.modified.setValue(modified);
  // diffEditor.layout();
  // diffEditor.setModel({
  //   original: monaco.editor.createModel(original),
  //   modified: monaco.editor.createModel(modified),
  // });

  // wait for diff ready
  return new Promise(res => {
    diffEditor.onDidUpdateDiff(() => {
      setTimeout(() => {
        res(undefined);
      }, 0);
    });
  });
}

export interface IViewerRelationWithModifiedRange extends IViewerRelation {
  fromModifiedRange: [number, number];
  toModifiedRange: [number, number];
  dirty: boolean;
}

export default async function({
  viewerRelations,
  viewerContents,
  fromModifiedContent,
  toModifiedContent,
}: {
  viewerRelations: IViewerRelation[];
  viewerContents: IViewerContents;
  fromModifiedContent: string;
  toModifiedContent: string;
}) {
  const relationsWithModifiedRange: IViewerRelationWithModifiedRange[] = [];

  if (!viewerRelations.length) {
    return relationsWithModifiedRange;
  }

  const fromDiffEditor = createDiffEditor(document.createElement('div'));
  const toDiffEditor = createDiffEditor(document.createElement('div'));
  let lastFromRev = '';
  let lastToRev = '';

  for (const viewerRelation of viewerRelations) {
    if (viewerRelation.originalFromViewerContentRev !== lastFromRev) {
      await setDiffEditorValue(
        fromDiffEditor,
        viewerContents[viewerRelation.originalFromViewerContentRev],
        fromModifiedContent
      );
      lastFromRev = viewerRelation.originalFromViewerContentRev;
    }

    const fromModifiedRange: [number, number] = [
      fromDiffEditor?.getDiffLineInformationForOriginal(
        viewerRelation.fromRange[0]
      )?.equivalentLineNumber || 0,
      fromDiffEditor?.getDiffLineInformationForOriginal(
        viewerRelation.fromRange[1]
      )?.equivalentLineNumber || 0,
    ];

    let dirty = false;

    const changes = fromDiffEditor?.getLineChanges() || [];
    for (const change of changes) {
      if (
        !(
          change.originalEndLineNumber < viewerRelation.fromRange[0] ||
          change.originalStartLineNumber > viewerRelation.fromRange[1]
        )
      ) {
        dirty = true;
        break;
      }
    }

    if (viewerRelation.originalToViewerContentRev !== lastToRev) {
      await setDiffEditorValue(
        toDiffEditor,
        viewerContents[viewerRelation.originalToViewerContentRev],
        toModifiedContent
      );
      lastToRev = viewerRelation.originalToViewerContentRev;
    }

    const toModifiedRange: [number, number] = [
      toDiffEditor?.getDiffLineInformationForOriginal(viewerRelation.toRange[0])
        ?.equivalentLineNumber || 0,
      toDiffEditor?.getDiffLineInformationForOriginal(viewerRelation.toRange[1])
        ?.equivalentLineNumber || 0,
    ];

    relationsWithModifiedRange.push({
      ...viewerRelation,
      fromModifiedRange,
      toModifiedRange,
      dirty,
    });
  }

  return relationsWithModifiedRange;
}
