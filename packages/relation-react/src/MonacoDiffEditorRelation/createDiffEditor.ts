import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export default (domElement: HTMLElement | null) => {
  if (!domElement) {
    return null;
  }

  const editor = monaco.editor.createDiffEditor(domElement, {
    diffWordWrap: 'on',
    renderSideBySide: false,
    renderOverviewRuler: false,
  });
  return editor;
};
