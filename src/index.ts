import { Change, diffLines } from "diff";
import { getNotChangedLiens } from "./getNotChangedLiens";

export enum RELATION_TYPE {
  FILE = "FILE",
  SECTION = "SECTION",
}

export interface IRelation {
  type: RELATION_TYPE;
  start?: number;
  end?: number;
  ditry?: boolean;
  // any other infomation
  [key: string]: any;
}

export interface IRelationCheckProp {
  oldFile?: string;
  newFile?: string;
  relations?: IRelation[];
}

export const relationCheck = ({
  oldFile = "",
  newFile = "",
  relations = [],
}: IRelationCheckProp = {}): IRelation[] => {
  const diffLinesResult = diffLines(oldFile, newFile);

  const notChangedLines = getNotChangedLiens(diffLinesResult);

  const relationsWithDirty = relations.map((relation) => {
    const newRelation = { ...relation, dirty: true };
    for (const notChangedLine of notChangedLines) {
      if (
        newRelation.start >= notChangedLine[0] &&
        newRelation.end <= notChangedLine[1]
      ) {
        newRelation.dirty = false;
      }
    }
    return newRelation;
  });

  return relationsWithDirty;
};
