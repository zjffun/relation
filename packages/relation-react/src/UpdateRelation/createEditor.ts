import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export default (domElement: HTMLElement | null) => {
  if (!domElement) {
    return null;
  }

  const editor = monaco.editor.create(domElement, {
    theme: 'vs-dark',
    minimap: {
      enabled: false,
    },
  });

  return editor;
};
