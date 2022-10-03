import { Dictionary } from "lodash";
import { join, split } from "split-split";
import { ICheckResult, IOriginalAndModifiedContentResult } from "../types";
import ChangeServer from "./ChangeServer.js";
import { checkDirty } from "./checkDirty.js";
import { getContent as getOriginalContent } from "./getContent.js";
import GitServer from "./GitServer.js";
import { groupByKey } from "./groupByKey.js";

const getLineNum = (content) => {
  return content.split("\n").length;
};

const getContentByRange = (content, range) => {
  const [substrings, separators] = split(content, ["\r\n", "\n"]);
  let result = join(
    substrings.slice(range[0] - 1, range[1]),
    separators.slice(range[0] - 1, range[1] - 1)
  );
  if (separators[range[1] - 1]) {
    result += separators[range[1] - 1];
  }
  return result;
};

// TODO: move to getContent
const getMergedRanges = async (
  rawRanges: {
    range;
    modifiedRange;
    rev;
  }[],
  { workingDirectory, baseDir, path }: { workingDirectory; baseDir; path }
) => {
  const ranges = JSON.parse(JSON.stringify(rawRanges));

  const sortedRanges = ranges.sort((a, b) => a.range[0] - b.range[0]);

  // merge same rev
  const tempMergedRanges = [];
  for (let i = 0; i < sortedRanges.length; i++) {
    const mergedRange = { ...sortedRanges[i] };

    while (i < sortedRanges.length - 1) {
      if (sortedRanges[i].rev !== sortedRanges[i + 1].rev) {
        break;
      }

      mergedRange.range[1] = sortedRanges[i + 1].range[1];
      mergedRange.modifiedRange[1] = sortedRanges[i + 1].modifiedRange[1];
      i++;
    }

    tempMergedRanges.push(mergedRange);
  }

  // merge same content
  const mergedRanges = [];
  for (let i = 0; i < tempMergedRanges.length; i++) {
    const mergedData = { ...tempMergedRanges[i] };

    while (i < tempMergedRanges.length - 1) {
      const changes = await ChangeServer.singleton().getFixedChanges(
        workingDirectory,
        tempMergedRanges[i].rev,
        tempMergedRanges[i + 1].rev,
        baseDir,
        path
      );

      const dirty = checkDirty({
        changes,
        range: tempMergedRanges[i + 1].range,
      });

      if (dirty) {
        break;
      }

      mergedData.range[1] = tempMergedRanges[i + 1].range[1];
      mergedData.modifiedRange[1] = tempMergedRanges[i + 1].modifiedRange[1];
      i++;
    }

    mergedRanges.push(mergedData);
  }

  return mergedRanges;
};

const getRangeLineCount = (range) => {
  return range[1] - range[0] + 1;
};

const getContent = async (
  ranges,
  {
    workingDirectory,
    baseDir,
    path,
    baseOriginalContent,
    originalRangeName,
  }: { workingDirectory; baseDir; path; baseOriginalContent; originalRangeName }
) => {
  const contents = [];
  let lineNum = 1;

  ranges.sort((a, b) => a.modifiedRange[0] - b.modifiedRange[0]);

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];

    const content = await GitServer.singleton().show(
      workingDirectory,
      range.rev,
      baseDir,
      path
    );

    /**
     * --- lines ---
     * first relation start
     */
    if (i === 0 && range.range[0] > 1) {
      const tempRange = [1, range.range[0] - 1];
      contents.push(getContentByRange(content, tempRange));
      lineNum += getRangeLineCount(tempRange);
    }

    /**
     * relation start
     * --- lines ---
     * relation end
     */
    contents.push(getContentByRange(content, range.range));
    const tempLineNum = lineNum + getRangeLineCount(range.range);
    range.checkResult[originalRangeName] = [lineNum, tempLineNum - 1];
    lineNum = tempLineNum;

    /**
     * relation end
     * --- lines ---
     * next relation start
     */
    if (i + 1 < ranges.length) {
      const nextRange = ranges[i + 1];

      const tempRange = [range.range[1] + 1, nextRange.range[0] - 1];
      contents.push(getContentByRange(content, tempRange));
      lineNum += getRangeLineCount(tempRange);
    }

    /**
     * last relation end
     * --- lines ---
     */
    if (i + 1 === ranges.length) {
      const end = getLineNum(content);

      const tempRange = [range.range[1] + 1, end];
      contents.push(getContentByRange(content, tempRange));
      lineNum += getRangeLineCount(tempRange);
    }
  }

  return contents.join("");
};

// add fromOriginalRange and toOriginalRange
export const getOriginalAndModifiedContent = async (
  workingDirectory: string,
  baseRev: string,
  checkResults: ICheckResult[]
): Promise<{ [key: string]: IOriginalAndModifiedContentResult }> => {
  const obj: { [key: string]: IOriginalAndModifiedContentResult } = {};

  const filesCheckResults: Dictionary<ICheckResult[]> = groupByKey(
    checkResults
  ) as any;

  for (const [key, fileCheckResults] of Object.entries(filesCheckResults)) {
    const checkResult = fileCheckResults[0];

    const baseFromOriginalContent = await getOriginalContent({
      workingDirectory,
      rev: baseRev,
      fileBaseDir: checkResult.fromBaseDir,
      filePath: checkResult.fromPath,
    });

    const baseToOriginalContent = await getOriginalContent({
      workingDirectory,
      rev: baseRev,
      fileBaseDir: checkResult.toBaseDir,
      filePath: checkResult.toPath,
    });

    let fromOriginalContent = "";
    let toOriginalContent = "";

    // fromOriginalContent
    {
      const baseDir = fileCheckResults[0].fromBaseDir;
      const path = fileCheckResults[0].fromPath;

      fromOriginalContent = await getContent(
        fileCheckResults.map((d) => {
          return {
            range: d.fromRange,
            modifiedRange: d.fromModifiedRange,
            rev: d.fromRev,
            checkResult: d,
          };
        }),
        {
          workingDirectory,
          baseDir,
          path,
          baseOriginalContent: baseFromOriginalContent,
          originalRangeName: "fromOriginalRange",
        }
      );
    }

    // toOriginalContent
    {
      const baseDir = fileCheckResults[0].toBaseDir;
      const path = fileCheckResults[0].toPath;

      toOriginalContent = await getContent(
        fileCheckResults.map((d) => {
          return {
            range: d.toRange,
            modifiedRange: d.toModifiedRange,
            rev: d.toRev,
            checkResult: d,
          };
        }),
        {
          workingDirectory,
          baseDir,
          path,
          baseOriginalContent: baseToOriginalContent,
          originalRangeName: "toOriginalRange",
        }
      );
    }

    obj[key] = {
      fromOriginalContent,
      fromModifiedContent: baseFromOriginalContent,
      toOriginalContent,
      toModifiedContent: baseToOriginalContent,
    };
  }

  return obj;
};
