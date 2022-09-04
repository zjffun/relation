import { Dictionary } from "lodash";
import { join, split } from "split-split";
import { ICheckResult, IOriginalAndModifiedContentResult } from "../types";
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

    // TODO: merge same original

    // fromOriginalContent
    fileCheckResults.sort((a, b) => a.fromRange[0] - b.fromRange[0]);

    for (let i = 0; i < fileCheckResults.length; i++) {
      let lastCheckResult;

      if (i > 0) {
        lastCheckResult = fileCheckResults[i - 1];
      } else {
        lastCheckResult = {
          fromModifiedRange: [0, 0],
        };
      }

      const checkResult = fileCheckResults[i];
      const lastFromModifiedRange = lastCheckResult.fromModifiedRange;
      const fromModifiedRange = checkResult.fromModifiedRange;
      const content = await GitServer.singleton().show(
        workingDirectory,
        checkResult.fromRev,
        checkResult.fromBaseDir,
        checkResult.fromPath
      );

      if (checkResult.fromModifiedRange[0] - lastFromModifiedRange[1] > 1) {
        fromOriginalContent += getContentByRange(baseFromOriginalContent, [
          lastFromModifiedRange[1] + 1,
          fromModifiedRange[0] - 1,
        ]);
      }

      fromOriginalContent += getContentByRange(content, checkResult.fromRange);
    }

    let lastCheckResult = fileCheckResults.at(-1);
    const lastFromModifiedRange = lastCheckResult.fromModifiedRange;
    const baseFromOriginalContentLineNum = getLineNum(baseFromOriginalContent);
    if (lastFromModifiedRange[1] < baseFromOriginalContentLineNum) {
      fromOriginalContent += getContentByRange(baseFromOriginalContent, [
        lastFromModifiedRange[1] + 1,
        baseFromOriginalContentLineNum,
      ]);
    }

    // toOriginalContent
    fileCheckResults.sort((a, b) => a.toRange[0] - b.toRange[0]);

    for (let i = 0; i < fileCheckResults.length; i++) {
      let lastCheckResult;

      if (i > 0) {
        lastCheckResult = fileCheckResults[i - 1];
      } else {
        lastCheckResult = {
          toModifiedRange: [0, 0],
        };
      }

      const checkResult = fileCheckResults[i];
      const lastToModifiedRange = lastCheckResult.toModifiedRange;
      const toModifiedRange = checkResult.toModifiedRange;
      const content = await GitServer.singleton().show(
        workingDirectory,
        checkResult.toRev,
        checkResult.toBaseDir,
        checkResult.toPath
      );

      if (checkResult.toModifiedRange[0] - lastToModifiedRange[1] > 1) {
        toOriginalContent += getContentByRange(baseToOriginalContent, [
          lastToModifiedRange[1] + 1,
          toModifiedRange[0] - 1,
        ]);
      }

      toOriginalContent += getContentByRange(content, checkResult.toRange);
    }

    lastCheckResult = fileCheckResults.at(-1);
    const lastToModifiedRange = lastCheckResult.toModifiedRange;
    const baseToOriginalContentLineNum = getLineNum(baseToOriginalContent);
    if (lastToModifiedRange[1] < baseToOriginalContentLineNum) {
      toOriginalContent += getContentByRange(baseToOriginalContent, [
        lastToModifiedRange[1] + 1,
        baseToOriginalContentLineNum,
      ]);
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
