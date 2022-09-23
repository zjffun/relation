import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export default (
  domElement: HTMLElement | null,
  {
    saveHandler,
  }: {
    saveHandler?: (editor: monaco.editor.ICodeEditor) => void;
  } = {}
) => {
  if (!domElement) {
    return null;
  }

  const editor = monaco.editor.createDiffEditor(domElement, {
    diffWordWrap: 'on',
    renderSideBySide: false,
    renderOverviewRuler: false,
  });

  if (saveHandler) {
    editor.addAction({
      id: 'save',
      label: 'Save',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      keybindingContext: '!editorReadonly',
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1,
      run: editor => {
        saveHandler(editor);
      },
    });
  }

  return editor;
};
