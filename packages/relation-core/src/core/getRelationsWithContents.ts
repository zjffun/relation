import {
  IContents,
  IRawRelationWithContentInfo,
  IRelationsWithContents
} from "../types.js";
import Relation from "./Relation.js";
import { sha1 } from "./sha1.js";

export const getRelationsWithContents = async (
  relations: Relation[]
): Promise<IRelationsWithContents> => {
  const contents: IContents = {};
  const relationsWithContentInfo: IRawRelationWithContentInfo[] = [];

  for (const relation of relations) {
    const originalFromContent = await relation.getFromOriginalContent();
    const originalFromContentRev = sha1(originalFromContent);

    const originalToContent = await relation.getToOriginalContent();
    const originalToContentRev = sha1(originalToContent);

    const modifiedFromContent = await relation.fromCurrentContent;
    const modifiedFromContentRev = sha1(modifiedFromContent);

    const modifiedToContent = await relation.toCurrentContent;
    const modifiedToContentRev = sha1(modifiedToContent);

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
