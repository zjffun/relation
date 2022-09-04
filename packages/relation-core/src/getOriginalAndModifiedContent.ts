import { getInfo } from "./core/getInfo.js";
import { getOriginalAndModifiedContent } from "./core/getOriginalAndModifiedContent.js";
import {
  ICheckResult,
  IOptions,
  IOriginalAndModifiedContentResult,
} from "./types";

export default async (
  options: IOptions & { relationsKey: string; checkResults: ICheckResult[] }
): Promise<IOriginalAndModifiedContentResult> => {
  const { workingDirectory, config } = getInfo(options);

  const obj = await getOriginalAndModifiedContent(
    workingDirectory,
    config.baseRev,
    options.checkResults
  );

  return obj[options.relationsKey];
};
