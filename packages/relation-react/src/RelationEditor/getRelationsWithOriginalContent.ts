import { join, split } from 'split-split';
import { IContents } from '../bundled';
import { IRelationWithModifiedRange } from './getRelationsWithModifiedRange';

const getLineNum = (content: string) => {
  return content.split('\n').length;
};

const getContentByRange = (content: string, range: [number, number]) => {
  if (range[0] > range[1]) {
    return '';
  }

  const [substrings, separators] = split(content, ['\r\n', '\n']);
  let result = join(
    substrings.slice(range[0] - 1, range[1]),
    separators.slice(range[0] - 1, range[1] - 1)
  );
  if (separators[range[1] - 1]) {
    result += separators[range[1] - 1];
  }
  return result;
};

const getRangeLineCount = (range: [number, number]) => {
  if (range[0] > range[1]) {
    return 0;
  }
  return range[1] - range[0] + 1;
};

const getContentAndRanges = ({
  rangeInfos,
  modifiedContent,
}: {
  rangeInfos: {
    id: string;
    modifiedRange: [number, number];
    content: string;
    range: [number, number];
  }[];
  modifiedContent: string;
}): [string, { [id: string]: [number, number] }] => {
  const ranges: { [id: string]: [number, number] } = {};
  const contents = [];
  let lineNum = 1;

  if (rangeInfos.length === 0) {
    return [modifiedContent, ranges];
  }

  rangeInfos.sort((a, b) => a.modifiedRange[0] - b.modifiedRange[0]);

  for (let i = 0; i < rangeInfos.length; i++) {
    const range = rangeInfos[i];

    const content = range.content;

    /**
     * --- lines ---
     * first relation start
     */
    if (i === 0 && range.modifiedRange[0] > 1) {
      const tempRange: [number, number] = [1, range.modifiedRange[0] - 1];
      contents.push(getContentByRange(modifiedContent, tempRange));
      lineNum += getRangeLineCount(tempRange);
    }

    /**
     * relation start
     * --- lines ---
     * relation end
     */
    contents.push(getContentByRange(content, range.range));
    const tempLineNum: number = lineNum + getRangeLineCount(range.range);
    ranges[range.id] = [lineNum, tempLineNum - 1];
    // console.log(getContentByRange(content, range.range), lineNum, tempLineNum);
    lineNum = tempLineNum;

    /**
     * relation end
     * --- lines ---
     * next relation start
     */
    if (i + 1 < rangeInfos.length) {
      const nextRange = rangeInfos[i + 1];

      const tempRange: [number, number] = [
        range.modifiedRange[1] + 1,
        nextRange.modifiedRange[0] - 1,
      ];
      contents.push(getContentByRange(modifiedContent, tempRange));
      lineNum += getRangeLineCount(tempRange);
    }

    /**
     * last relation end
     * --- lines ---
     */
    if (i + 1 === rangeInfos.length) {
      const end = getLineNum(modifiedContent);

      const tempRange: [number, number] = [range.modifiedRange[1] + 1, end];
      contents.push(getContentByRange(modifiedContent, tempRange));
      lineNum += getRangeLineCount(tempRange);
    }
  }

  return [contents.join(''), ranges];
};

export interface IRelationWithOriginalContentInfo
  extends IRelationWithModifiedRange {
  fromOriginalContentRev: string;
  toOriginalContentRev: string;
  fromOriginalRange: [number, number];
  toOriginalRange: [number, number];
}

export default function({
  relationsWithModifiedRange,
  contents,
}: {
  relationsWithModifiedRange: IRelationWithModifiedRange[];
  contents: IContents;
}): [IRelationWithOriginalContentInfo[], IContents] {
  const relationsWithOriginalContentInfo: IRelationWithOriginalContentInfo[] = [];

  if (!relationsWithModifiedRange.length) {
    return [relationsWithOriginalContentInfo, contents];
  }

  const fromModifiedContent =
    contents[relationsWithModifiedRange[0]._modifiedFromContentRev];
  const toModifiedContent =
    contents[relationsWithModifiedRange[0]._modifiedToContentRev];

  const [fromOriginalContent, fromOriginalRanges] = getContentAndRanges({
    rangeInfos: relationsWithModifiedRange.map(d => ({
      id: d.id,
      modifiedRange: d.fromModifiedRange,
      content: contents[d._originalFromContentRev],
      range: d.fromRange,
    })),
    modifiedContent: fromModifiedContent,
  });

  const [toOriginalContent, toOriginalRanges] = getContentAndRanges({
    rangeInfos: relationsWithModifiedRange.map(d => ({
      id: d.id,
      modifiedRange: d.toModifiedRange,
      content: contents[d._originalToContentRev],
      range: d.toRange,
    })),
    modifiedContent: toModifiedContent,
  });

  relationsWithModifiedRange.forEach(d => {
    relationsWithOriginalContentInfo.push({
      ...d,
      fromOriginalContentRev: 'fromOriginalContentRev',
      toOriginalContentRev: 'toOriginalContentRev',
      fromOriginalRange: fromOriginalRanges[d.id],
      toOriginalRange: toOriginalRanges[d.id],
    });
  });

  return [
    relationsWithOriginalContentInfo,
    {
      ...contents,
      fromOriginalContentRev: fromOriginalContent,
      toOriginalContentRev: toOriginalContent,
    },
  ];
}
