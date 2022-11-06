import {
  IContents,
  IRawRelation,
  IRawRelationWithContentInfo,
  IRelationsWithContents,
} from "../types.js";
import { getContent } from "./getContent.js";

export const getRelationsWithContents = async (
  workingDirectory: string,
  relations: IRawRelation[]
): Promise<IRelationsWithContents> => {
  const contents: IContents = {};
  const relationsWithContentInfo: IRawRelationWithContentInfo[] = [];

  for (const relation of relations) {
    const [originalFromContentRev, originalFromContent] = await getContent({
      workingDirectory,
      path: relation.fromPath,
      contentRev: relation.fromContentRev,
      gitRev: relation.fromGitRev,
      gitWorkingDirectory: relation.fromGitWorkingDirectory,
    });

    const [originalToContentRev, originalToContent] = await getContent({
      workingDirectory,
      path: relation.toPath,
      contentRev: relation.toContentRev,
      gitRev: relation.toGitRev,
      gitWorkingDirectory: relation.toGitWorkingDirectory,
    });

    const [modifiedFromContentRev, modifiedFromContent] = await getContent({
      workingDirectory,
      path: relation.fromPath,
    });

    const [modifiedToContentRev, modifiedToContent] = await getContent({
      workingDirectory,
      path: relation.toPath,
    });

    relationsWithContentInfo.push({
      ...relation,
      _originalFromContentRev: originalFromContentRev,
      _originalToContentRev: originalToContentRev,
      _modifiedFromContentRev: modifiedFromContentRev,
      _modifiedToContentRev: modifiedToContentRev,
    });

    contents[originalFromContentRev] = originalFromContent;
    contents[originalToContentRev] = originalToContent;
    contents[modifiedFromContentRev] = modifiedFromContent;
    contents[modifiedToContentRev] = modifiedToContent;
  }

  return { relationsWithContentInfo, contents };
};
