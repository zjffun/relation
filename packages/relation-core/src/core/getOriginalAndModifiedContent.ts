import { Dictionary } from "lodash";
import { join, split } from "split-split";
import { ICheckResult, IOriginalAndModifiedContentResult } from "../types";
import ChangeServer from "./ChangeServer.js";
import { checkDirty } from "./checkDirty.js";
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
        range: tempMergedRanges[i].range,
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

const getContent = async (
  ranges,
  {
    workingDirectory,
    baseDir,
    path,
    baseOriginalContent,
  }: { workingDirectory; baseDir; path; baseOriginalContent }
) => {
  const contents = [];
  let lastModifiedRange = [0, 0];

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];

    const content = await GitServer.singleton().show(
      workingDirectory,
      range.rev,
      baseDir,
      path
    );

    if (range.modifiedRange[0] - lastModifiedRange[1] > 1) {
      contents.push(
        getContentByRange(baseOriginalContent, [
          lastModifiedRange[1] + 1,
          range.modifiedRange[0] - 1,
        ])
      );
    }

    contents.push(getContentByRange(content, range.range));

    lastModifiedRange = range.modifiedRange;
  }

  const baseOriginalContentLineNum = getLineNum(baseOriginalContent);

  if (lastModifiedRange[1] < baseOriginalContentLineNum) {
    contents.push(
      getContentByRange(baseOriginalContent, [
        lastModifiedRange[1] + 1,
        baseOriginalContentLineNum,
      ])
    );
  }
  return contents.join("");
};

export const getOriginalAndModifiedContent = async (
  workingDirectory: string,
  baseRev: string,
  checkResults: ICheckResult[]
): Promise<{ [key: string]: IOriginalAndModifiedContentResult }> => {
  const obj: { [key: string]: IOriginalAndModifiedContentResult } = {};

  const filesCheckResults: Dictionary<ICheckResult[]> = groupByKey(
    checkResults
  ) as any;

  const gitServer = new GitServer();

  for (const [key, fileCheckResults] of Object.entries(filesCheckResults)) {
    const checkResult = fileCheckResults[0];

    const parsedFromBaseRev = await gitServer.parseRev(
      workingDirectory,
      baseRev,
      checkResult.fromBaseDir
    );

    const parsedToBaseRev = await gitServer.parseRev(
      workingDirectory,
      baseRev,
      checkResult.toBaseDir
    );

    let fromOriginalContent = "";
    let toOriginalContent = "";
    const baseFromOriginalContent = await GitServer.singleton().show(
      workingDirectory,
      parsedFromBaseRev,
      checkResult.fromBaseDir,
      checkResult.fromPath
    );
    const baseToOriginalContent = await GitServer.singleton().show(
      workingDirectory,
      parsedToBaseRev,
      checkResult.toBaseDir,
      checkResult.toPath
    );

    // fromOriginalContent
    {
      const baseDir = fileCheckResults[0].fromBaseDir;
      const path = fileCheckResults[0].fromPath;
      const ranges = await getMergedRanges(
        fileCheckResults.map((d) => {
          return {
            range: d.fromRange,
            modifiedRange: d.fromModifiedRange,
            rev: d.fromRev,
          };
        }),
        {
          workingDirectory,
          baseDir,
          path,
        }
      );

      fromOriginalContent = await getContent(ranges, {
        workingDirectory,
        baseDir,
        path,
        baseOriginalContent: baseFromOriginalContent,
      });
    }

    // toOriginalContent
    {
      const baseDir = fileCheckResults[0].toBaseDir;
      const path = fileCheckResults[0].toPath;
      const ranges = await getMergedRanges(
        fileCheckResults.map((d) => {
          return {
            range: d.toRange,
            modifiedRange: d.toModifiedRange,
            rev: d.toRev,
          };
        }),
        {
          workingDirectory,
          baseDir,
          path,
        }
      );

      toOriginalContent = await getContent(ranges, {
        workingDirectory,
        baseDir,
        path,
        baseOriginalContent: baseToOriginalContent,
      });
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
