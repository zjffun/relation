const getLastLeftMiddleRightScrollTopMap = ({
  fromEditor,
  toEditor,
  leftMiddleRightScrollTopMaps,
}) => {
  const fromLineTopEnd = fromEditor.getTopForLineNumber(
    Number.POSITIVE_INFINITY
  );
  const toLineTopEnd = toEditor.getTopForLineNumber(Number.POSITIVE_INFINITY);

  const lastLeftMiddleRightScrollTopMaps = leftMiddleRightScrollTopMaps.at(-1);
  if (lastLeftMiddleRightScrollTopMaps) {
    const fromLineTopStart = lastLeftMiddleRightScrollTopMaps[0][1];
    const middleTopStart = lastLeftMiddleRightScrollTopMaps[1][1];
    const toLineTopStart = lastLeftMiddleRightScrollTopMaps[2][1];

    return [
      [fromLineTopStart, fromLineTopEnd],
      [
        middleTopStart,
        middleTopStart +
          Math.max(
            fromLineTopEnd - fromLineTopStart,
            toLineTopEnd - toLineTopStart
          ),
      ],
      [toLineTopStart, toLineTopEnd],
    ];
  }

  return [
    [0, fromLineTopEnd],
    [0, Math.max(fromLineTopEnd, toLineTopEnd)],
    [0, toLineTopEnd],
  ];
};

const getGapLeftMiddleRightScrollTopMap = ({
  fromLineTopStart,
  toLineTopStart,
  leftMiddleRightScrollTopMaps,
}) => {
  const lastLeftMiddleRightScrollTopMaps = leftMiddleRightScrollTopMaps.at(-1);

  if (lastLeftMiddleRightScrollTopMaps) {
    const lastFromLineTopStart = lastLeftMiddleRightScrollTopMaps[0][1];
    const lastMiddleTopStart = lastLeftMiddleRightScrollTopMaps[1][1];
    const lastToLineTopStart = lastLeftMiddleRightScrollTopMaps[2][1];
    const middleTopEnd =
      lastMiddleTopStart +
      Math.max(
        fromLineTopStart - lastFromLineTopStart,
        toLineTopStart - lastFromLineTopStart
      );
    return [
      [lastFromLineTopStart, fromLineTopStart],
      [lastMiddleTopStart, middleTopEnd],
      [lastToLineTopStart, toLineTopStart],
    ];
  }

  const middleTopStart = 0;
  const middleTopEnd = Math.max(fromLineTopStart, toLineTopStart);
  return [
    [0, fromLineTopStart],
    [middleTopStart, middleTopEnd],
    [0, toLineTopStart],
  ];
};

export default ({ fromEditor, toEditor, relations }) => {
  const leftMiddleRightScrollTopMaps = [];

  relations.forEach(([fromLine, toLine]) => {
    let fromLineTopEnd, toLineTopEnd;

    const fromLineTopStart = fromEditor.getTopForLineNumber(fromLine[0]);
    if (fromLine[1] !== null) {
      fromLineTopEnd = fromEditor.getTopForLineNumber(fromLine[1] + 1);
    } else {
      fromLineTopEnd = fromLineTopStart;
    }

    const toLineTopStart = toEditor.getTopForLineNumber(toLine[0]);
    if (toLine[1] !== null) {
      toLineTopEnd = toEditor.getTopForLineNumber(toLine[1] + 1);
    } else {
      toLineTopEnd = toLineTopStart;
    }

    const gapLeftMiddleRightScrollTopMap = getGapLeftMiddleRightScrollTopMap({
      fromLineTopStart,
      toLineTopStart,
      leftMiddleRightScrollTopMaps,
    });

    leftMiddleRightScrollTopMaps.push(gapLeftMiddleRightScrollTopMap);

    const middleTopStart = gapLeftMiddleRightScrollTopMap[1][1];
    const middleTopEnd =
      middleTopStart +
      Math.max(
        fromLineTopEnd - fromLineTopStart,
        toLineTopEnd - toLineTopStart
      );

    leftMiddleRightScrollTopMaps.push([
      [fromLineTopStart, fromLineTopEnd],
      [middleTopStart, middleTopEnd],
      [toLineTopStart, toLineTopEnd],
    ]);
  });

  leftMiddleRightScrollTopMaps.push(
    getLastLeftMiddleRightScrollTopMap({
      fromEditor,
      toEditor,
      leftMiddleRightScrollTopMaps,
    })
  );

  return leftMiddleRightScrollTopMaps;
};
