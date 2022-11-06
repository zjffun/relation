import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {
  IRawRelationWithContentInfo,
  IRelationsWithContents,
} from '../bundled';

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

export interface IRelationWithModifiedRange
  extends IRawRelationWithContentInfo {
  fromModifiedRange: [number, number];
  toModifiedRange: [number, number];
  dirty: boolean;
}

export default async function(relationsWithContents: IRelationsWithContents) {
  const { relationsWithContentInfo, contents } = relationsWithContents;
  const relationsWithModifiedRange: IRelationWithModifiedRange[] = [];

  if (!relationsWithContentInfo.length) {
    return relationsWithModifiedRange;
  }

  const fromDiffEditor = createDiffEditor(document.createElement('div'));
  const toDiffEditor = createDiffEditor(document.createElement('div'));
  let lastFromRev = '';
  let lastToRev = '';

  const fromModifiedContent =
    contents[relationsWithContentInfo[0]._modifiedFromContentRev];
  const toModifiedContent =
    contents[relationsWithContentInfo[0]._modifiedToContentRev];

  for (const relationWithContentInfo of relationsWithContentInfo) {
    if (relationWithContentInfo._originalFromContentRev !== lastFromRev) {
      await setDiffEditorValue(
        fromDiffEditor,
        contents[relationWithContentInfo._originalFromContentRev],
        fromModifiedContent
      );
      lastFromRev = relationWithContentInfo._originalFromContentRev;
    }

    const fromModifiedRange: [number, number] = [
      fromDiffEditor?.getDiffLineInformationForOriginal(
        relationWithContentInfo.fromRange[0]
      )?.equivalentLineNumber || 0,
      fromDiffEditor?.getDiffLineInformationForOriginal(
        relationWithContentInfo.fromRange[1]
      )?.equivalentLineNumber || 0,
    ];

    let dirty = false;

    const changes = fromDiffEditor?.getLineChanges() || [];
    for (const change of changes) {
      if (
        !(
          change.originalEndLineNumber < relationWithContentInfo.fromRange[0] ||
          change.originalStartLineNumber > relationWithContentInfo.fromRange[1]
        )
      ) {
        dirty = true;
        break;
      }
    }

    if (relationWithContentInfo._originalToContentRev !== lastToRev) {
      await setDiffEditorValue(
        toDiffEditor,
        contents[relationWithContentInfo._originalToContentRev],
        toModifiedContent
      );
      lastToRev = relationWithContentInfo._originalToContentRev;
    }

    const toModifiedRange: [number, number] = [
      toDiffEditor?.getDiffLineInformationForOriginal(
        relationWithContentInfo.toRange[0]
      )?.equivalentLineNumber || 0,
      toDiffEditor?.getDiffLineInformationForOriginal(
        relationWithContentInfo.toRange[1]
      )?.equivalentLineNumber || 0,
    ];

    relationsWithModifiedRange.push({
      ...relationWithContentInfo,
      fromModifiedRange,
      toModifiedRange,
      dirty,
    });
  }

  return relationsWithModifiedRange;
}
