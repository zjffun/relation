export default ({ fromEditor, toEditor, relations }) => {
  const fromScrollTop = fromEditor.getScrollTop();
  const toScrollTop = toEditor.getScrollTop();

  const { width: fromEditorWidth, left: fromEditorLeft } = fromEditor
    .getDomNode()
    .getBoundingClientRect();
  const fromLeft = 0;
  const fromRight = fromEditorWidth;

  const { width: toEditorWidth, left: toEditorLeft } = toEditor
    .getDomNode()
    .getBoundingClientRect();
  const toLeft = toEditorLeft - fromEditorLeft;
  const toRight = toLeft + toEditorWidth;

  const links = [];

  relations.forEach(([fromLine, toLine, info]) => {
    const type = info?.type;

    let fromLineTopEnd, toLineTopEnd;

    const fromLineTopStart = fromEditor.getTopForLineNumber(fromLine[0]);
    if (fromLine[1] !== null) {
      fromLineTopEnd = fromEditor.getTopForLineNumber(fromLine[1] + 1);
    } else {
      fromLineTopEnd = fromLineTopStart;
    }
    const fromLine1TopSubScrollTop = fromLineTopStart - fromScrollTop;
    const fromLine2TopSubScrollTop = fromLineTopEnd - fromScrollTop;

    const toLineTopStart = toEditor.getTopForLineNumber(toLine[0]);
    if (toLine[1] !== null) {
      toLineTopEnd = toEditor.getTopForLineNumber(toLine[1] + 1);
    } else {
      toLineTopEnd = toLineTopStart;
    }
    const toLine1TopSubScrollTop = toLineTopStart - toScrollTop;
    const toLine2TopSubScrollTop = toLineTopEnd - toScrollTop;

    links.push({
      source: [
        [fromLeft, fromLine1TopSubScrollTop],
        [fromRight, fromLine1TopSubScrollTop],
        [fromRight, fromLine2TopSubScrollTop],
        [fromLeft, fromLine2TopSubScrollTop],
      ],
      target: [
        [toLeft, toLine1TopSubScrollTop],
        [toRight, toLine1TopSubScrollTop],
        [toRight, toLine2TopSubScrollTop],
        [toLeft, toLine2TopSubScrollTop],
      ],
      type,
    });
  });

  return links;
};
