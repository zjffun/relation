import { Dictionary } from "lodash";
import { ICheckResult, IOriginalAndModifiedContentResult } from "../types";
import { getContent } from "./getContent.js";
import { groupByKey } from "./groupByKey.js";

const getOriginalContents = async ({ workingDirectory, fileCheckResults }) => {
  const fromOriginalContents = {};
  const toOriginalContents = {};

  for (const checkResult of fileCheckResults) {
    fromOriginalContents[checkResult.fromRev] = await getContent({
      workingDirectory,
      rev: checkResult.fromRev,
      fileBaseDir: checkResult.fromBaseDir,
      filePath: checkResult.fromPath,
    });

    toOriginalContents[checkResult.toRev] = await getContent({
      workingDirectory,
      rev: checkResult.toRev,
      fileBaseDir: checkResult.toBaseDir,
      filePath: checkResult.toPath,
    });
  }

  return {
    fromOriginalContents,
    toOriginalContents,
  };
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

  for (const [key, fileCheckResults] of Object.entries(filesCheckResults)) {
    const checkResult = fileCheckResults[0];

    const fromModifiedContent = await getContent({
      workingDirectory,
      rev: baseRev,
      fileBaseDir: checkResult.fromBaseDir,
      filePath: checkResult.fromPath,
    });

    const toModifiedContent = await getContent({
      workingDirectory,
      rev: baseRev,
      fileBaseDir: checkResult.toBaseDir,
      filePath: checkResult.toPath,
    });

    const {
      fromOriginalContents,
      toOriginalContents,
    } = await getOriginalContents({ workingDirectory, fileCheckResults });

    obj[key] = {
      fromOriginalContents,
      fromModifiedContent,
      toOriginalContents,
      toModifiedContent,
    };
  }

  return obj;
};
